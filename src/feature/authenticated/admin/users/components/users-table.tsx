'use no memo'

import * as React from 'react'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import {
  CheckCircle,
  CreditCard,
  MoreHorizontal,
  Shield,
  Text,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getSortingStateParser } from '@/lib/parsers'

import { useDataTable } from '@/hooks/use-data-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { getUsers } from '../api/fake-users'
import { callTypes } from '../data/data'
import type { User } from '../data/schema'
import { UsersTableActionBar } from './users-table-action-bar'

const EmptyList: Array<User> = []

export function DataTableDemo() {
  const { t } = useTranslation('feature')

  const statusOptions = React.useMemo(
    () => [
      { label: t('users.status.active'), value: 'active', icon: CheckCircle },
      { label: t('users.status.inactive'), value: 'inactive', icon: XCircle },
      { label: t('users.status.invited'), value: 'invited', icon: CheckCircle },
      { label: t('users.status.suspended'), value: 'suspended', icon: XCircle },
    ],
    [t]
  )

  const roleOptions = React.useMemo(
    () => [
      { label: t('users.role.superadmin'), value: 'superadmin', icon: Shield },
      { label: t('users.role.admin'), value: 'admin', icon: UserCheck },
      { label: t('users.role.manager'), value: 'manager', icon: Users },
      { label: t('users.role.cashier'), value: 'cashier', icon: CreditCard },
    ],
    [t]
  )

  const [enableAdvancedFilter, setEnableAdvancedFilter] = React.useState(false)

  const columnIds = React.useMemo(
    () => new Set(['username', 'email', 'status', 'role', 'createdAt']),
    []
  )

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [sorting] = useQueryState(
    'sort',
    getSortingStateParser<User>(columnIds).withDefault([{ id: 'createdAt', desc: true }])
  )
  const [username, setUsername] = useQueryState('username', parseAsString.withDefault(''))
  const [status, setStatus] = useQueryState(
    'status',
    parseAsArrayOf(parseAsString, ',').withDefault([])
  )
  const [role, setRole] = useQueryState('role', parseAsArrayOf(parseAsString, ',').withDefault([]))
  const [filters, setFilters] = useQueryState('filters', parseAsString.withDefault(''))

  const onTabChange = React.useCallback(
    (value: string) => {
      const isAdvanced = value === 'advanced'
      setEnableAdvancedFilter(isAdvanced)
      void setPage(1)
      if (isAdvanced) {
        void setUsername(null)
        void setStatus(null)
        void setRole(null)
      } else {
        void setFilters(null)
      }
    },
    [setPage, setUsername, setStatus, setRole, setFilters]
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', { page, perPage, sorting, username, status, role, filters }],
    queryFn: () =>
      getUsers({
        page,
        perPage,
        sort: sorting,
        username: username || undefined,
        status: status.length > 0 ? status : undefined,
        role: role.length > 0 ? role : undefined,
        filters: filters || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'username',
        accessorKey: 'username',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.username')} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.username}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
        meta: {
          label: t('users.columns.username'),
          placeholder: t('users.search'),
          variant: 'text',
          icon: Text,
        },
        enableColumnFilter: true,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.status')} />
        ),
        cell: ({ cell }) => {
          const status = cell.getValue<User['status']>()
          const badgeClass = callTypes.get(status) ?? ''

          return (
            <Badge variant="outline" className={`capitalize ${badgeClass}`}>
              {status}
            </Badge>
          )
        },
        meta: {
          label: t('users.columns.status'),
          variant: 'multiSelect',
          options: statusOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.role')} />
        ),
        cell: ({ cell }) => {
          const role = cell.getValue<User['role']>()
          const option = roleOptions.find((o) => o.value === role)
          const Icon = option?.icon

          return (
            <div className="flex items-center gap-1.5 capitalize">
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              {role}
            </div>
          )
        },
        meta: {
          label: t('users.columns.role'),
          variant: 'multiSelect',
          options: roleOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.createdAt')} />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>()
          return <div>{new Date(date).toLocaleDateString()}</div>
        },
        meta: {
          label: t('users.columns.createdAt'),
          variant: 'date',
        },
        enableColumnFilter: true,
      },
      {
        id: 'actions',
        cell: function Cell() {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('users.openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{t('users.edit')}</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">{t('users.delete')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 32,
      },
    ],
    [t, statusOptions, roleOptions]
  )

  const { table } = useDataTable({
    data: data?.data ?? EmptyList,
    columns,
    pageCount: data?.pageCount ?? -1,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    getRowId: (row) => row.id,
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} filterCount={3} />
  }

  return (
    <div className="data-table-container space-y-4">
      <Tabs value={enableAdvancedFilter ? 'advanced' : 'simple'} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="simple">{t('users.tabs.simple')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('users.tabs.advanced')}</TabsTrigger>
        </TabsList>
      </Tabs>
      <DataTable
        table={table}
        isFetching={isFetching && !isLoading}
        actionBar={
          <UsersTableActionBar
            table={table}
            statusOptions={statusOptions}
            roleOptions={roleOptions}
          />
        }
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableFilterList table={table} />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} />
        )}
      </DataTable>
    </div>
  )
}

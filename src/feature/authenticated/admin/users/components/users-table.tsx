'use no memo'

import * as React from 'react'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import type { User } from '@/schema/user/user'
import { deleteUsers, getUsers } from '@/service/admin/users'
import { CheckCircle, MoreHorizontal, Shield, Text, XCircle } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getSortingStateParser } from '@/lib/parsers'

import { useDataTable } from '@/hooks/use-data-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import ConfirmDialog from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { UserEditDialog } from './user-edit-dialog'
import { UsersTableActionBar } from './users-table-action-bar'

const EmptyList: Array<User> = []

export function UsersTable() {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [editUser, setEditUser] = React.useState<User | null>(null)

  const deleteMutation = useMutation({
    mutationFn: deleteUsers,
    onSuccess: () => {
      setDeleteId(null)
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const enabledOptions = React.useMemo(
    () => [
      { label: t('users.enabled.true'), value: 'true', icon: CheckCircle },
      { label: t('users.enabled.false'), value: 'false', icon: XCircle },
    ],
    [t]
  )

  const roleOptions = React.useMemo(
    () => [
      { label: 'Super Admin', value: 'superadmin', icon: Shield },
      { label: 'Admin', value: 'admin', icon: Shield },
      { label: 'Manager', value: 'manager', icon: Shield },
      { label: 'Cashier', value: 'cashier', icon: Shield },
    ],
    []
  )

  const [enableAdvancedFilter, setEnableAdvancedFilter] = React.useState(false)

  const columnIds = React.useMemo(() => new Set(['last_login_at', 'created_at']), [])

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [sorting] = useQueryState(
    'sort',
    getSortingStateParser<User>(columnIds).withDefault([{ id: 'created_at', desc: true }])
  )
  const [username, setUsername] = useQueryState('username', parseAsString.withDefault(''))
  const [enabled, setEnabled] = useQueryState(
    'enabled',
    parseAsArrayOf(parseAsString, ',').withDefault([])
  )
  const [roles, setRoles] = useQueryState(
    'roles',
    parseAsArrayOf(parseAsString, ',').withDefault([])
  )
  const [filters, setFilters] = useQueryState('filters', parseAsString.withDefault(''))

  const onTabChange = React.useCallback(
    (value: string) => {
      const isAdvanced = value === 'advanced'
      setEnableAdvancedFilter(isAdvanced)
      void setPage(1)
      if (isAdvanced) {
        void setUsername(null)
        void setEnabled(null)
        void setRoles(null)
      } else {
        void setFilters(null)
      }
    },
    [setPage, setUsername, setEnabled, setRoles, setFilters]
  )

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['users', { page, perPage, sorting, username, enabled, roles, filters }],
    queryFn: () =>
      getUsers({
        page,
        perPage,
        sort: sorting,
        username: username || undefined,
        enabled: enabled.length === 1 ? enabled[0] === 'true' : undefined,
        roles: roles.length > 0 ? roles : undefined,
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
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={row.original.avatar} alt={row.original.username} />
              <AvatarFallback>{row.original.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{row.original.username}</span>
              <span className="text-xs text-muted-foreground">{row.original.email}</span>
            </div>
          </div>
        ),
        meta: {
          label: t('users.columns.username'),
          placeholder: t('users.search'),
          variant: 'text',
          icon: Text,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'enabled',
        accessorKey: 'enabled',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.enabled')} />
        ),
        cell: ({ cell }) => {
          const isEnabled = cell.getValue<boolean>()
          return (
            <Badge
              variant="outline"
              className={
                isEnabled
                  ? 'border-teal-200 bg-teal-100/30 text-teal-900 dark:text-teal-200'
                  : 'border-neutral-300 bg-neutral-300/40'
              }
            >
              {isEnabled ? t('users.enabled.true') : t('users.enabled.false')}
            </Badge>
          )
        },
        meta: {
          label: t('users.columns.enabled'),
          variant: 'multiSelect',
          options: enabledOptions,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'roles',
        accessorKey: 'roles',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.roles')} />
        ),
        cell: ({ row }) => {
          const userRoles = row.original.roles
          return (
            <div className="flex items-center gap-1">
              {userRoles.map((r) => (
                <Badge key={r.code} variant="secondary" className="text-xs">
                  {r.name}
                </Badge>
              ))}
            </div>
          )
        },
        meta: {
          label: t('users.columns.roles'),
          variant: 'multiSelect',
          options: roleOptions,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'last_login_at',
        accessorKey: 'last_login_at',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.lastLogin')} />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date | null>()
          return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>
        },
        meta: {
          label: t('users.columns.lastLogin'),
        },
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('users.columns.createdAt')} />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>()
          return <div>{new Date(date).toLocaleDateString()}</div>
        },
        meta: {
          label: t('users.columns.createdAt'),
        },
      },
      {
        id: 'actions',
        cell: function Cell({ row }) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('users.openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditUser(row.original)}>
                  {t('users.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteId(row.original.id)}
                >
                  {t('users.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 32,
      },
    ],
    [t, enabledOptions, roleOptions, setDeleteId, setEditUser]
  )

  const { table } = useDataTable({
    data: data?.data ?? EmptyList,
    columns,
    rowCount: data?.total ?? 0,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: 'created_at', desc: true }],
      columnPinning: { right: ['actions'] },
    },
    getRowId: (row) => String(row.id),
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={7} filterCount={3} />
  }

  const filterToggle = (
    <ToggleGroup
      type="single"
      value={enableAdvancedFilter ? 'advanced' : 'simple'}
      onValueChange={(value) => {
        if (value) onTabChange(value)
      }}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="simple">{t('users.tabs.simple')}</ToggleGroupItem>
      <ToggleGroupItem value="advanced">{t('users.tabs.advanced')}</ToggleGroupItem>
    </ToggleGroup>
  )

  return (
    <>
      <div className="data-table-container">
        <DataTable
          table={table}
          isFetching={isFetching && !isLoading}
          actionBar={<UsersTableActionBar table={table} enabledOptions={enabledOptions} />}
        >
          {enableAdvancedFilter ? (
            <DataTableAdvancedToolbar table={table} actions={filterToggle}>
              <DataTableFilterList table={table} />
              <DataTableSortList table={table} />
            </DataTableAdvancedToolbar>
          ) : (
            <DataTableToolbar table={table} onSearch={() => refetch()}>
              {filterToggle}
            </DataTableToolbar>
          )}
        </DataTable>
      </div>
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title={t('users.deleteConfirm.title')}
        desc={t('users.deleteConfirm.single', {
          username: (data?.data ?? []).find((u) => u.id === deleteId)?.username ?? '',
        })}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate([deleteId])
        }}
      />
      <UserEditDialog
        user={editUser}
        open={editUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditUser(null)
        }}
      />
    </>
  )
}

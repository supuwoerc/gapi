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

import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { getUsers } from '../api/fake-users'
import { callTypes } from '../data/data'
import type { User } from '../data/schema'

const statusOptions = [
  { label: 'Active', value: 'active', icon: CheckCircle },
  { label: 'Inactive', value: 'inactive', icon: XCircle },
  { label: 'Invited', value: 'invited', icon: CheckCircle },
  { label: 'Suspended', value: 'suspended', icon: XCircle },
]

const roleOptions = [
  { label: 'Superadmin', value: 'superadmin', icon: Shield },
  { label: 'Admin', value: 'admin', icon: UserCheck },
  { label: 'Manager', value: 'manager', icon: Users },
  { label: 'Cashier', value: 'cashier', icon: CreditCard },
]

const EmptyList: Array<User> = []

export function DataTableDemo() {
  const columnIds = React.useMemo(
    () => new Set(['username', 'email', 'status', 'role', 'createdAt']),
    []
  )

  const [page] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [sorting] = useQueryState(
    'sort',
    getSortingStateParser<User>(columnIds).withDefault([{ id: 'createdAt', desc: true }])
  )
  const [username] = useQueryState('username', parseAsString.withDefault(''))
  const [status] = useQueryState('status', parseAsArrayOf(parseAsString, ',').withDefault([]))
  const [role] = useQueryState('role', parseAsArrayOf(parseAsString, ',').withDefault([]))

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', { page, perPage, sorting, username, status, role }],
    queryFn: () =>
      getUsers({
        page,
        perPage,
        sort: sorting,
        username: username || undefined,
        status: status.length > 0 ? status : undefined,
        role: role.length > 0 ? role : undefined,
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
          <DataTableColumnHeader column={column} label="Username" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.username}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
        meta: {
          label: 'Username',
          placeholder: 'Search users...',
          variant: 'text',
          icon: Text,
        },
        enableColumnFilter: true,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label="Status" />
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
          label: 'Status',
          variant: 'multiSelect',
          options: statusOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label="Role" />
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
          label: 'Role',
          variant: 'multiSelect',
          options: roleOptions,
        },
        enableColumnFilter: true,
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }: { column: Column<User, unknown> }) => (
          <DataTableColumnHeader column={column} label="Created At" />
        ),
        cell: ({ cell }) => {
          const date = cell.getValue<Date>()
          return <div>{new Date(date).toLocaleDateString()}</div>
        },
      },
      {
        id: 'actions',
        cell: function Cell() {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 32,
      },
    ],
    []
  )

  const { table } = useDataTable({
    data: data?.data ?? EmptyList,
    columns,
    pageCount: data?.pageCount ?? -1,
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
    <div className="data-table-container">
      <DataTable table={table} isFetching={isFetching && !isLoading}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  )
}

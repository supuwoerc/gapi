import type { ColumnDef } from '@tanstack/react-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import { roles, statuses } from './data'
import type { User } from './schema'

const badgeVariantMap: Record<User['status'], 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  invited: 'outline',
}

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      label: 'Name',
      variant: 'text',
      placeholder: 'Search users...',
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
    cell: ({ row }) => {
      const user = row.original
      const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'role',
    accessorKey: 'role',
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      label: 'Role',
      variant: 'select',
      options: roles,
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label="Role" />,
    cell: ({ row }) => {
      const value = row.getValue<User['role']>('role')
      const role = roles.find((r) => r.value === value)
      if (!role) return null

      const Icon = role.icon
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" />
          <span>{role.label}</span>
        </div>
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      label: 'Status',
      variant: 'select',
      options: statuses,
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
    cell: ({ row }) => {
      const value = row.getValue<User['status']>('status')
      const status = statuses.find((s) => s.value === value)
      if (!status) return null

      const Icon = status.icon
      return (
        <Badge variant={badgeVariantMap[value]}>
          <Icon className="size-3" />
          {status.label}
        </Badge>
      )
    },
  },
  {
    id: 'department',
    accessorKey: 'department',
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} label="Department" />,
    cell: ({ row }) => <span>{row.getValue<string>('department')}</span>,
  },
  {
    id: 'lastLogin',
    accessorKey: 'lastLogin',
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} label="Last Login" />,
    cell: ({ row }) => {
      const date = row.getValue<Date>('lastLogin')
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      )
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} label="Created" />,
    cell: ({ row }) => {
      const date = row.getValue<Date>('createdAt')
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      )
    },
  },
]

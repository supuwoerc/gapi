'use no memo'

import * as React from 'react'

import type { ColumnDef } from '@tanstack/react-table'

import type { ProjectMember, ProjectRole } from '@/schema/project/project'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatDate } from '@/lib/format'

import { useDataTable } from '@/hooks/use-data-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { DataTable } from '@/components/data-table/data-table'

interface MembersTableProps {
  members: ProjectMember[]
  membersTotal: number
  roles: ProjectRole[]
  canManageMembers: boolean
  isFetching: boolean
  isUpdatingRole: boolean
  isRemoving: boolean
  onRoleChange: (memberId: number, roleId: number) => void
  onRemove: (member: ProjectMember) => void
}

export function MembersTable({
  members,
  membersTotal,
  roles,
  canManageMembers,
  isFetching,
  isUpdatingRole,
  isRemoving,
  onRoleChange,
  onRemove,
}: MembersTableProps) {
  const { t, i18n } = useTranslation('feature')

  const columns = React.useMemo<ColumnDef<ProjectMember>[]>(() => {
    const baseColumns: ColumnDef<ProjectMember>[] = [
      {
        id: 'member',
        accessorFn: (member) => member.user.username,
        header: t('projects.columns.member'),
        cell: ({ row }) => (
          <div className="flex min-w-60 items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={row.original.user.avatar} alt={row.original.user.username} />
              <AvatarFallback>{row.original.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{row.original.user.username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {row.original.user.email}
              </span>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('projects.columns.status'),
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'secondary' : 'outline'}>
            {t(`projects.status.${row.original.status}`)}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        id: 'role',
        accessorFn: (member) => member.project_role.name,
        header: t('projects.columns.role'),
        cell: ({ row }) =>
          canManageMembers ? (
            <Select
              value={String(row.original.project_role_id)}
              disabled={isUpdatingRole}
              onValueChange={(value) => onRoleChange(row.original.id, Number(value))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline">{row.original.project_role.name}</Badge>
          ),
        enableSorting: false,
      },
      {
        id: 'joined_at',
        accessorKey: 'joined_at',
        header: t('projects.columns.joinedAt'),
        cell: ({ row }) =>
          row.original.joined_at
            ? formatDate(row.original.joined_at, { dateStyle: 'medium' }, i18n.language)
            : '-',
        enableSorting: false,
      },
    ]

    if (canManageMembers) {
      baseColumns.push({
        id: 'actions',
        header: () => <span className="sr-only">{t('projects.columns.actions')}</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isRemoving}
              onClick={() => onRemove(row.original)}
            >
              <Trash2 />
              <span className="sr-only">{t('projects.removeMember')}</span>
            </Button>
          </div>
        ),
        size: 80,
        enableSorting: false,
      })
    }

    return baseColumns
  }, [
    canManageMembers,
    i18n.language,
    isRemoving,
    isUpdatingRole,
    onRemove,
    onRoleChange,
    roles,
    t,
  ])

  const { table } = useDataTable({
    data: members,
    columns,
    rowCount: membersTotal,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnPinning: canManageMembers ? { right: ['actions'] } : { left: [], right: [] },
    },
    queryKeys: {
      page: 'memberPage',
      perPage: 'memberPerPage',
      sort: 'memberSort',
      filters: 'memberFilters',
    },
    getRowId: (row) => String(row.id),
  })

  return (
    <div className="data-table-container flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <DataTable
        table={table}
        isFetching={isFetching}
        className="min-h-0 w-full min-w-0 flex-1 overflow-hidden"
        tableContentClassName="min-h-0 w-full min-w-0 flex-1 overflow-auto"
      />
    </div>
  )
}

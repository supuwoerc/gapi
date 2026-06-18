'use no memo'

import * as React from 'react'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import type { RolePermission } from '@/schema/admin/permission'
import type { RoleTree } from '@/schema/admin/role'
import { deleteRoles, getRoles } from '@/service/admin/roles'
import { CheckCircle, MoreHorizontal, Plus, Shield, Text, Trash2, XCircle } from 'lucide-react'
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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

import ConfirmDialog from '@/components/confirm-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

import { RoleEditDialog } from './role-edit-dialog'
import { RolesTableActionBar } from './roles-table-action-bar'

const EmptyList: RoleTree[] = []
const EmptyInheritedPermissions: RolePermission[] = []

interface RoleDialogContext {
  parentId: number | null
  parentName: string | null
  inheritedPermissions: RolePermission[]
}

const EmptyRoleDialogContext: RoleDialogContext = {
  parentId: null,
  parentName: null,
  inheritedPermissions: EmptyInheritedPermissions,
}

function findRole(roles: RoleTree[], id: number | null): RoleTree | undefined {
  if (id === null) return undefined

  for (const role of roles) {
    if (role.id === id) return role
    const child = findRole(role.children, id)
    if (child) return child
  }
}

function getEffectivePermissions(role: RoleTree | undefined): RolePermission[] {
  return role?.effective_permissions ?? role?.permissions ?? EmptyInheritedPermissions
}

export function RolesTable() {
  const { t } = useTranslation('roles')
  const queryClient = useQueryClient()
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [editingRoleId, setEditingRoleId] = React.useState<number | null>(null)
  const [roleDialogContext, setRoleDialogContext] =
    React.useState<RoleDialogContext>(EmptyRoleDialogContext)
  const [deleteRole, setDeleteRole] = React.useState<RoleTree | null>(null)

  const [keyword] = useQueryState('keyword', parseAsString.withDefault(''))
  const [enabled] = useQueryState('enabled', parseAsArrayOf(parseAsString, ',').withDefault([]))
  const [page] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(20))

  const {
    data: rolesPage,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['roles', { page, perPage, keyword, enabled }],
    queryFn: () =>
      getRoles({
        page,
        perPage,
        keyword: keyword || undefined,
        enabled: enabled.length === 1 ? enabled[0] === 'true' : undefined,
      }),
    placeholderData: keepPreviousData,
  })
  const data = rolesPage?.data ?? EmptyList

  const deleteMutation = useMutation({
    mutationFn: deleteRoles,
    onSuccess: () => {
      toast.success(t('deleteConfirm.success'))
      setDeleteRole(null)
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  const enabledOptions = React.useMemo(
    () => [
      { label: t('enabled.true'), value: 'true', icon: CheckCircle },
      { label: t('enabled.false'), value: 'false', icon: XCircle },
    ],
    [t]
  )

  const columns = React.useMemo<ColumnDef<RoleTree>[]>(
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
            aria-label={t('selectAll')}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t('selectRow')}
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'keyword',
        accessorFn: (row) => row.name,
        header: ({ column }: { column: Column<RoleTree, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.name')} />
        ),
        cell: ({ row }) => (
          <div className="min-w-56 space-x-1">
            <span className="font-medium">{row.original.name}</span>
            <Badge variant="secondary">{row.original.code}</Badge>
          </div>
        ),
        meta: {
          label: t('columns.name'),
          placeholder: t('search'),
          variant: 'text',
          icon: Text,
          expander: true,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'enabled',
        accessorKey: 'enabled',
        header: ({ column }: { column: Column<RoleTree, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.enabled')} />
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
              {isEnabled ? t('enabled.true') : t('enabled.false')}
            </Badge>
          )
        },
        meta: {
          label: t('columns.enabled'),
          variant: 'multiSelect',
          options: enabledOptions,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'permissions',
        header: ({ column }: { column: Column<RoleTree, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.configCount')} />
        ),
        cell: ({ row }) => {
          const effectivePermissions =
            row.original.effective_permissions ?? row.original.permissions
          const inheritedCount = Math.max(
            0,
            effectivePermissions.length - row.original.permissions.length
          )
          const directCount = row.original.permissions.length

          return (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              {t('permissionEffect.configCount', {
                inherited: inheritedCount,
                direct: directCount,
              })}
            </Badge>
          )
        },
        meta: {
          label: t('columns.configCount'),
        },
        enableSorting: false,
      },
      {
        id: 'effective_permissions',
        header: ({ column }: { column: Column<RoleTree, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.effectivePermissions')} />
        ),
        cell: ({ row }) => {
          const effectivePermissions =
            row.original.effective_permissions ?? row.original.permissions
          const allowCount = effectivePermissions.filter(
            (permission) => permission.effect === 'allow'
          ).length
          const denyCount = effectivePermissions.filter(
            (permission) => permission.effect === 'deny'
          ).length

          return (
            <Badge
              variant="secondary"
              className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            >
              {t('permissionEffect.effectSummary', {
                allow: allowCount,
                deny: denyCount,
              })}
            </Badge>
          )
        },
        meta: {
          label: t('columns.effectivePermissions'),
        },
        enableSorting: false,
      },
      {
        id: 'sort_order',
        accessorKey: 'sort_order',
        header: ({ column }: { column: Column<RoleTree, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.sortOrder')} />
        ),
        meta: {
          label: t('columns.sortOrder'),
        },
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: ({ column }: { column: Column<RoleTree, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.createdAt')} />
        ),
        cell: ({ cell }) => <div>{new Date(cell.getValue<Date>()).toLocaleDateString()}</div>,
        meta: {
          label: t('columns.createdAt'),
        },
      },
      {
        id: 'actions',
        cell: function Cell({ row }) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">{t('openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const parentRole = findRole(data, row.original.parent_id)
                    setEditingRoleId(row.original.id)
                    setRoleDialogContext({
                      parentId: row.original.parent_id,
                      parentName: parentRole?.name ?? null,
                      inheritedPermissions: getEffectivePermissions(parentRole),
                    })
                    setRoleDialogOpen(true)
                  }}
                >
                  <Shield />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingRoleId(null)
                    setRoleDialogContext({
                      parentId: row.original.id,
                      parentName: row.original.name,
                      inheritedPermissions: getEffectivePermissions(row.original),
                    })
                    setRoleDialogOpen(true)
                  }}
                >
                  <Plus />
                  {t('createChild')}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteRole(row.original)}>
                  <Trash2 />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 32,
      },
    ],
    [data, enabledOptions, t]
  )

  const { table } = useDataTable({
    data,
    columns,
    rowCount: rolesPage?.total ?? 0,
    getRowId: (row) => String(row.id),
    enableExpanding: true,
    getSubRows: (row) => row.children,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 },
      sorting: [{ id: 'sort_order', desc: false }],
      columnPinning: { right: ['actions'] },
    },
    getRowCanExpand: (row) => row.original.children.length > 0,
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={8} filterCount={2} />
  }

  return (
    <>
      <div className="data-table-container">
        <DataTable
          table={table}
          isFetching={isFetching && !isLoading}
          actionBar={<RolesTableActionBar table={table} />}
        >
          <DataTableToolbar table={table} onSearch={() => refetch()}>
            <Button
              size="sm"
              onClick={() => {
                setEditingRoleId(null)
                setRoleDialogContext(EmptyRoleDialogContext)
                setRoleDialogOpen(true)
              }}
            >
              <Plus />
              {t('create')}
            </Button>
          </DataTableToolbar>
        </DataTable>
      </div>
      <ConfirmDialog
        open={deleteRole !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteRole(null)
        }}
        title={t('deleteConfirm.title')}
        desc={t('deleteConfirm.single', { name: deleteRole?.name ?? '' })}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (deleteRole) deleteMutation.mutate([deleteRole.id])
        }}
      />
      <RoleEditDialog
        roleId={editingRoleId}
        parentId={roleDialogContext.parentId}
        parentName={roleDialogContext.parentName}
        inheritedPermissions={roleDialogContext.inheritedPermissions}
        open={roleDialogOpen}
        onOpenChange={(open) => {
          setRoleDialogOpen(open)
          if (!open) {
            setEditingRoleId(null)
            setRoleDialogContext(EmptyRoleDialogContext)
          }
        }}
      />
    </>
  )
}

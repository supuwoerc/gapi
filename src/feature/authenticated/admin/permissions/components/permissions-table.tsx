'use no memo'

import * as React from 'react'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Column, ColumnDef } from '@tanstack/react-table'

import type { Permission } from '@/schema/admin/permission'
import { deletePermissions, getPermissions } from '@/service/admin/permissions'
import { MoreHorizontal, Pencil, Plus, Text, Trash2 } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
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
import { LongText } from '@/components/long-text'

import { PermissionEditDialog } from './permission-edit-dialog'
import { PermissionsTableActionBar } from './permissions-table-action-bar'

const EmptyList: Permission[] = []

export function PermissionsTable() {
  const { t } = useTranslation('permissions')
  const queryClient = useQueryClient()
  const [deletePermission, setDeletePermission] = React.useState<Permission | null>(null)
  const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false)
  const [editingPermissionId, setEditingPermissionId] = React.useState<number | null>(null)

  const [page] = useQueryState('page', parseAsInteger.withDefault(1))
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [keyword] = useQueryState('keyword', parseAsString.withDefault(''))

  const {
    data: permissionsPage,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['permissions', { page, perPage, keyword }],
    queryFn: () =>
      getPermissions({
        page,
        perPage,
        keyword: keyword || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePermissions,
    onSuccess: () => {
      toast.success(t('deleteConfirm.success'))
      setDeletePermission(null)
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })

  const columns = React.useMemo<ColumnDef<Permission>[]>(
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
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.name')} />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-56 flex-col gap-1">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs break-all text-muted-foreground">{row.original.code}</span>
          </div>
        ),
        meta: {
          label: t('columns.name'),
          placeholder: t('search'),
          variant: 'text',
          icon: Text,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.description')} />
        ),
        cell: ({ cell }) => (
          <LongText className="max-w-80" contentClassName="max-w-sm">
            {cell.getValue<string>()}
          </LongText>
        ),
        meta: {
          label: t('columns.description'),
        },
        enableSorting: false,
      },
      {
        id: 'module',
        accessorKey: 'module',
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.module')} />
        ),
        cell: ({ cell }) => <Badge variant="secondary">{cell.getValue<string>()}</Badge>,
        meta: {
          label: t('columns.module'),
        },
        enableSorting: false,
      },
      {
        id: 'resource_path',
        accessorKey: 'resource_path',
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.resourcePath')} />
        ),
        cell: ({ cell }) => (
          <LongText className="max-w-64 font-mono text-xs" contentClassName="max-w-sm break-all">
            {cell.getValue<string>()}
          </LongText>
        ),
        meta: {
          label: t('columns.resourcePath'),
        },
        enableSorting: false,
      },
      {
        id: 'action',
        accessorKey: 'action',
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.action')} />
        ),
        cell: ({ cell }) => {
          const action = cell.getValue<Permission['action']>()
          return <Badge variant="outline">{t(`action.${action}`)}</Badge>
        },
        meta: {
          label: t('columns.action'),
        },
        enableSorting: false,
      },
      {
        id: 'resource_type',
        accessorKey: 'resource_type',
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.resourceType')} />
        ),
        cell: ({ cell }) => {
          const resourceType = cell.getValue<Permission['resource_type']>()
          return <Badge variant="secondary">{t(`resourceType.${resourceType}`)}</Badge>
        },
        meta: {
          label: t('columns.resourceType'),
        },
        enableSorting: false,
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.createdAt')} />
        ),
        cell: ({ cell }) => <div>{new Date(cell.getValue<Date>()).toLocaleDateString()}</div>,
        meta: {
          label: t('columns.createdAt'),
        },
        enableSorting: false,
      },
      {
        id: 'updated_at',
        accessorKey: 'updated_at',
        header: ({ column }: { column: Column<Permission, unknown> }) => (
          <DataTableColumnHeader column={column} label={t('columns.updatedAt')} />
        ),
        cell: ({ cell }) => <div>{new Date(cell.getValue<Date>()).toLocaleDateString()}</div>,
        meta: {
          label: t('columns.updatedAt'),
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        cell: function Cell({ row }) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                  <span className="sr-only">{t('openMenu')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingPermissionId(row.original.id)
                    setPermissionDialogOpen(true)
                  }}
                >
                  <Pencil />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeletePermission(row.original)}
                >
                  <Trash2 />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 32,
        enableSorting: false,
      },
    ],
    [t]
  )

  const { table } = useDataTable({
    data: permissionsPage?.data ?? EmptyList,
    columns,
    rowCount: permissionsPage?.total ?? 0,
    getRowId: (row) => String(row.id),
    initialState: {
      columnPinning: { right: ['actions'] },
    },
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={10} filterCount={1} />
  }

  return (
    <>
      <div className="data-table-container">
        <DataTable
          table={table}
          isFetching={isFetching && !isLoading}
          actionBar={<PermissionsTableActionBar table={table} />}
        >
          <DataTableToolbar table={table} onSearch={() => refetch()}>
            <Button
              size="sm"
              onClick={() => {
                setEditingPermissionId(null)
                setPermissionDialogOpen(true)
              }}
            >
              <Plus />
              {t('create')}
            </Button>
          </DataTableToolbar>
        </DataTable>
      </div>
      <ConfirmDialog
        open={deletePermission !== null}
        onOpenChange={(open) => {
          if (!open) setDeletePermission(null)
        }}
        title={t('deleteConfirm.title')}
        desc={t('deleteConfirm.single', { name: deletePermission?.name ?? '' })}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (deletePermission) deleteMutation.mutate([deletePermission.id])
        }}
      />
      <PermissionEditDialog
        permissionId={editingPermissionId}
        open={permissionDialogOpen}
        onOpenChange={(open) => {
          setPermissionDialogOpen(open)
          if (!open) setEditingPermissionId(null)
        }}
      />
    </>
  )
}

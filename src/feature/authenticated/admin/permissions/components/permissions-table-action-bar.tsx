import * as React from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Table } from '@tanstack/react-table'

import type { Permission } from '@/schema/admin/permission'
import { deletePermissions } from '@/service/admin/roles'
import { Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from '@/components/ui/action-bar'
import { ScrollArea } from '@/components/ui/scroll-area'

import ConfirmDialog from '@/components/confirm-dialog'

interface PermissionsTableActionBarProps {
  table: Table<Permission>
}

export function PermissionsTableActionBar({ table }: PermissionsTableActionBarProps) {
  'use no memo'
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const rows = table.getFilteredSelectedRowModel().rows
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const deleteMutation = useMutation({
    mutationFn: deletePermissions,
    onSuccess: () => {
      toast.success(t('permissions.deleteConfirm.success'))
      table.toggleAllRowsSelected(false)
      setConfirmOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) table.toggleAllRowsSelected(false)
    },
    [table]
  )

  const onConfirmDelete = React.useCallback(() => {
    deleteMutation.mutate(rows.map((row) => row.original.id))
  }, [deleteMutation, rows])

  return (
    <>
      <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
        <ActionBarSelection>
          <span className="font-medium">{rows.length}</span>
          <span>{t('permissions.actionBar.selected')}</span>
          <ActionBarSeparator />
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem
            variant="destructive"
            onSelect={(event) => event.preventDefault()}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
            {t('permissions.actionBar.delete')}
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('permissions.deleteConfirm.title')}
        desc={t('permissions.deleteConfirm.desc', { count: rows.length })}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={onConfirmDelete}
      >
        <ScrollArea className="max-h-48">
          <div className="flex flex-col gap-1 py-2">
            {rows.map((row) => (
              <div key={row.original.id} className="rounded-md border px-3 py-2 text-sm">
                <div className="font-medium">{row.original.name}</div>
                <div className="text-xs text-muted-foreground">{row.original.description}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </ConfirmDialog>
    </>
  )
}

'use no memo'

import * as React from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Table } from '@tanstack/react-table'

import type { Notification } from '@/schema/notifications/notifications'
import { deleteNotifications, markNotificationsRead } from '@/service/notifications/list'
import { CheckCheck, Trash2, X } from 'lucide-react'
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

interface NotificationsTableActionBarProps {
  table: Table<Notification>
}

export function NotificationsTableActionBar({ table }: NotificationsTableActionBarProps) {
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const rows = table.getFilteredSelectedRowModel().rows

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false)
      }
    },
    [table]
  )

  const markReadMutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      toast.success(t('notifications.toast.markAsReadSuccess'))
      table.toggleAllRowsSelected(false)
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotifications,
    onSuccess: () => {
      toast.success(t('notifications.toast.deleteSuccess'))
      table.toggleAllRowsSelected(false)
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const onMarkRead = React.useCallback(() => {
    const ids = rows.map((row) => row.original.id)
    markReadMutation.mutate({ ids })
  }, [rows, markReadMutation])

  const onDelete = React.useCallback(() => {
    const ids = rows.map((row) => row.original.id)
    deleteMutation.mutate({ ids })
  }, [rows, deleteMutation])

  return (
    <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
      <ActionBarSelection>
        <span className="font-medium">{rows.length}</span>
        <span>{t('notifications.actionBar.selected')}</span>
        <ActionBarSeparator />
        <ActionBarClose>
          <X />
        </ActionBarClose>
      </ActionBarSelection>
      <ActionBarSeparator />
      <ActionBarGroup>
        <ActionBarItem onClick={onMarkRead} disabled={markReadMutation.isPending}>
          <CheckCheck />
          {t('notifications.actionBar.markAsRead')}
        </ActionBarItem>
        <ActionBarItem variant="destructive" onClick={onDelete} disabled={deleteMutation.isPending}>
          <Trash2 />
          {t('notifications.actionBar.delete')}
        </ActionBarItem>
      </ActionBarGroup>
    </ActionBar>
  )
}

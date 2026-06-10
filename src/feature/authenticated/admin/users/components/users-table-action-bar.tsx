import * as React from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Table } from '@tanstack/react-table'

import type { User } from '@/schema/user/user'
import { deleteUsers } from '@/service/admin/users'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle, Trash2, X } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

import ConfirmDialog from '@/components/confirm-dialog'

interface UsersTableActionBarProps {
  table: Table<User>
  enabledOptions: { label: string; value: string; icon: LucideIcon }[]
}

export function UsersTableActionBar({ table, enabledOptions }: UsersTableActionBarProps) {
  'use no memo'
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const rows = table.getFilteredSelectedRowModel().rows
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const deleteMutation = useMutation({
    mutationFn: deleteUsers,
    onSuccess: () => {
      toast.success(`Deleted ${rows.length} user(s)`)
      table.toggleAllRowsSelected(false)
      setConfirmOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false)
      }
    },
    [table]
  )

  const onUserUpdate = React.useCallback(
    (value: string) => {
      toast.success(`Updated enabled to "${value}" for ${rows.length} user(s)`)
    },
    [rows]
  )

  const onConfirmDelete = React.useCallback(() => {
    const ids = rows.map((row) => row.original.id)
    deleteMutation.mutate(ids)
  }, [rows, deleteMutation])

  return (
    <>
      <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
        <ActionBarSelection>
          <span className="font-medium">{rows.length}</span>
          <span>{t('users.actionBar.selected')}</span>
          <ActionBarSeparator />
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionBarItem>
                <CheckCircle />
                {t('users.actionBar.enabled')}
              </ActionBarItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {enabledOptions.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => onUserUpdate(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionBarItem
            variant="destructive"
            onSelect={(e) => e.preventDefault()}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
            {t('users.actionBar.delete')}
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('users.deleteConfirm.title')}
        desc={t('users.deleteConfirm.desc', { count: rows.length })}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={onConfirmDelete}
      >
        <ScrollArea className="max-h-48">
          <div className="flex flex-col gap-1 py-2">
            {rows.map((row) => (
              <div
                key={row.original.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <Avatar className="size-8">
                  <AvatarImage src={row.original.avatar} alt={row.original.username} />
                  <AvatarFallback>{row.original.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{row.original.username}</span>
                  <span className="text-xs text-muted-foreground">{row.original.email}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </ConfirmDialog>
    </>
  )
}

import * as React from 'react'

import type { Table } from '@tanstack/react-table'

import type { User } from '@/schema/user/user'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UsersTableActionBarProps {
  table: Table<User>
  enabledOptions: { label: string; value: string; icon: LucideIcon }[]
}

export function UsersTableActionBar({ table, enabledOptions }: UsersTableActionBarProps) {
  'use no memo'
  const { t } = useTranslation('feature')
  const rows = table.getFilteredSelectedRowModel().rows

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

  const onUserDelete = React.useCallback(() => {
    toast.success(`Deleted ${rows.length} user(s)`)
    table.toggleAllRowsSelected(false)
  }, [rows, table])

  return (
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
        <ActionBarItem variant="destructive" onClick={onUserDelete}>
          <Trash2 />
          {t('users.actionBar.delete')}
        </ActionBarItem>
      </ActionBarGroup>
    </ActionBar>
  )
}

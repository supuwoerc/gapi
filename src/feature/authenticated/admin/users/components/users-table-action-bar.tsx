import * as React from 'react'

import type { Table } from '@tanstack/react-table'

import type { LucideIcon } from 'lucide-react'
import { CheckCircle, Shield, Trash2, X } from 'lucide-react'
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

import type { User } from '../data/schema'

interface UsersTableActionBarProps {
  table: Table<User>
  statusOptions: { label: string; value: string; icon: LucideIcon }[]
  roleOptions: { label: string; value: string; icon: LucideIcon }[]
}

export function UsersTableActionBar({
  table,
  statusOptions,
  roleOptions,
}: UsersTableActionBarProps) {
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
    (field: 'status' | 'role', value: string) => {
      toast.success(`Updated ${field} to "${value}" for ${rows.length} user(s)`)
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
        <span>selected</span>
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
              Status
            </ActionBarItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="capitalize"
                onClick={() => onUserUpdate('status', option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ActionBarItem>
              <Shield />
              Role
            </ActionBarItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {roleOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="capitalize"
                onClick={() => onUserUpdate('role', option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ActionBarItem variant="destructive" onClick={onUserDelete}>
          <Trash2 />
          Delete
        </ActionBarItem>
      </ActionBarGroup>
    </ActionBar>
  )
}

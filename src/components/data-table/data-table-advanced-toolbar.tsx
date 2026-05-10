'use client'
'use no memo'

import type * as React from 'react'

import type { Table } from '@tanstack/react-table'

import { cn } from '@/lib/utils'

import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'

interface DataTableAdvancedToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>
  actions?: React.ReactNode
}

export function DataTableAdvancedToolbar<TData>({
  table,
  actions,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn('flex w-full items-start justify-between gap-2 p-1', className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} align="end" />
      </div>
    </div>
  )
}

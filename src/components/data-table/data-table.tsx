import type * as React from 'react'

import { type Table as TanstackTable, flexRender } from '@tanstack/react-table'

import { ChevronRightIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getColumnPinningStyle } from '@/lib/data-table'
import { cn } from '@/lib/utils'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from '@/components/data-table/data-table-pagination'

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>
  actionBar?: React.ReactNode
  isFetching?: boolean
  paginationVariant?: 'simple' | 'numbered'
}

export function DataTable<TData>({
  table,
  actionBar,
  isFetching,
  paginationVariant,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  'use no memo'
  const { t } = useTranslation('component')
  return (
    <div className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)} {...props}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...getColumnPinningStyle({ column: header.column }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching ? (
              Array.from({ length: table.getState().pagination.pageSize }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id} style={{ ...getColumnPinningStyle({ column }) }}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isExpandableColumn =
                      cellIndex === row.getVisibleCells().findIndex((c) => c.column.id !== 'select')
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getColumnPinningStyle({ column: cell.column }),
                        }}
                      >
                        {isExpandableColumn && row.depth > 0 ? (
                          <div
                            className="flex items-center"
                            style={{ paddingLeft: `${row.depth * 1.5}rem` }}
                          >
                            {row.getCanExpand() ? (
                              <button
                                type="button"
                                className="mr-1 flex size-5 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
                                onClick={row.getToggleExpandedHandler()}
                              >
                                <ChevronRightIcon
                                  className={cn(
                                    'size-4 transition-transform',
                                    row.getIsExpanded() && 'rotate-90'
                                  )}
                                />
                              </button>
                            ) : (
                              <span className="mr-1 size-5 shrink-0" />
                            )}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ) : isExpandableColumn && row.getCanExpand() ? (
                          <div className="flex items-center">
                            <button
                              type="button"
                              className="mr-1 flex size-5 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
                              onClick={row.getToggleExpandedHandler()}
                            >
                              <ChevronRightIcon
                                className={cn(
                                  'size-4 transition-transform',
                                  row.getIsExpanded() && 'rotate-90'
                                )}
                              />
                            </button>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  {t('dataTable.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} variant={paginationVariant} />
        {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
      </div>
    </div>
  )
}

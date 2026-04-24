'use no memo'

import type { Table } from '@tanstack/react-table'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { getPageNumbers } from '@/lib/data-table'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>
  pageSizeOptions?: number[]
  variant?: 'simple' | 'numbered'
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  variant = 'numbered',
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation('component')
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()

  return (
    <div
      className={cn(
        'flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8',
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center space-x-2">
        <p className="text-sm font-medium whitespace-nowrap">
          {t('dataTable.pagination.rowsPerPage')}
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-18 data-size:h-8">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center justify-center text-sm font-medium">
          {t('dataTable.pagination.pageOf', { current: currentPage, total: totalPages })}
        </div>
        <div className="flex items-center space-x-2">
          {variant === 'simple' && (
            <Button
              aria-label={t('dataTable.pagination.goToFirstPage')}
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft />
            </Button>
          )}
          <Button
            aria-label={t('dataTable.pagination.goToPreviousPage')}
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          {variant === 'numbered' &&
            getPageNumbers(currentPage, totalPages).map((pageNumber, index) => (
              <div key={`${pageNumber}-${index}`} className="flex items-center">
                {pageNumber === '...' ? (
                  <span className="px-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    aria-label={t('dataTable.pagination.goToPage', { page: pageNumber })}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    className="h-8 min-w-8 px-2"
                    onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                  >
                    {pageNumber}
                  </Button>
                )}
              </div>
            ))}
          <Button
            aria-label={t('dataTable.pagination.goToNextPage')}
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          {variant === 'simple' && (
            <Button
              aria-label={t('dataTable.pagination.goToLastPage')}
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

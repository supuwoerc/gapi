import type { Column } from '@tanstack/react-table'

import type { ExtendedColumnFilter, FilterOperator, FilterVariant } from '@/types/data-table'

export const filterVariants = [
  'text',
  'number',
  'range',
  'date',
  'dateRange',
  'boolean',
  'select',
  'multiSelect',
] as const

export const operators = [
  'iLike',
  'notILike',
  'eq',
  'ne',
  'inArray',
  'notInArray',
  'isEmpty',
  'isNotEmpty',
  'lt',
  'lte',
  'gt',
  'gte',
  'isBetween',
  'isRelativeToToday',
] as const

export const joinOperators = ['and', 'or'] as const

const operatorsByVariant: Record<FilterVariant, FilterOperator[]> = {
  text: ['iLike', 'notILike', 'eq', 'ne', 'isEmpty', 'isNotEmpty'],
  number: ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'isBetween', 'isEmpty', 'isNotEmpty'],
  range: ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'isBetween', 'isEmpty', 'isNotEmpty'],
  date: [
    'eq',
    'ne',
    'lt',
    'gt',
    'lte',
    'gte',
    'isBetween',
    'isRelativeToToday',
    'isEmpty',
    'isNotEmpty',
  ],
  dateRange: [
    'eq',
    'ne',
    'lt',
    'gt',
    'lte',
    'gte',
    'isBetween',
    'isRelativeToToday',
    'isEmpty',
    'isNotEmpty',
  ],
  boolean: ['eq', 'ne'],
  select: ['eq', 'ne', 'isEmpty', 'isNotEmpty'],
  multiSelect: ['inArray', 'notInArray', 'isEmpty', 'isNotEmpty'],
}

export function getFilterOperators(filterVariant: FilterVariant): FilterOperator[] {
  return operatorsByVariant[filterVariant] ?? operatorsByVariant.text
}

export function getColumnPinningStyle<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>
  withBorder?: boolean
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? '-4px 0 4px -4px var(--border) inset'
        : isFirstRightPinnedColumn
          ? '4px 0 4px -4px var(--border) inset'
          : undefined
      : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? 'sticky' : 'relative',
    background: isPinned ? 'var(--background)' : 'var(--background)',
    width: column.getSize(),
    zIndex: isPinned ? 1 : undefined,
  }
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
  const operators = getFilterOperators(filterVariant)

  return operators[0] ?? (filterVariant === 'text' ? 'iLike' : 'eq')
}

export function getValidFilters<TData>(
  filters: ExtendedColumnFilter<TData>[]
): ExtendedColumnFilter<TData>[] {
  return filters.filter(
    (filter) =>
      filter.operator === 'isEmpty' ||
      filter.operator === 'isNotEmpty' ||
      (Array.isArray(filter.value)
        ? filter.value.length > 0
        : filter.value !== '' && filter.value !== null && filter.value !== undefined)
  )
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}

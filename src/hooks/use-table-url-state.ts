import { useMemo, useState } from 'react'

import type { ColumnFiltersState, OnChangeFn, PaginationState } from '@tanstack/react-table'

import { type useNavigate, useSearchParams } from 'react-router'

import { parsePositiveInt } from '@/lib/utils'

type SearchRecord = Record<string, unknown>

export type NavigateFn = ReturnType<typeof useNavigate>

type UseTableUrlStateParams = {
  search: SearchRecord
  pagination?: {
    pageKey?: string
    pageSizeKey?: string
    defaultPage?: number
    defaultPageSize?: number
  }
  globalFilter?: {
    enabled?: boolean
    key?: string
    trim?: boolean
  }
  columnFilters?: Array<
    | {
        columnId: string
        searchKey: string
        type?: 'string'
        // Optional transformers for custom types
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string
        searchKey: string
        type: 'array'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
  >
}

type UseTableUrlStateReturn = {
  // Global filter
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  // Column filters
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  // Pagination
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  // Helpers
  ensurePageInRange: (pageCount: number, opts?: { resetTo?: 'first' | 'last' }) => void
}

export function useTableUrlState(params: UseTableUrlStateParams): UseTableUrlStateReturn {
  const {
    search,
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  const pageKey = paginationCfg?.pageKey ?? ('page' as string)
  const pageSizeKey = paginationCfg?.pageSizeKey ?? ('pageSize' as string)
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  const globalFilterKey = globalFilterCfg?.key ?? ('filter' as string)
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  const [_, setSearchParams] = useSearchParams()

  // Build initial column filters from the current search params
  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      const raw = (search as SearchRecord)[cfg.searchKey]
      const deserialize = cfg.deserialize ?? ((v: unknown) => v)
      if (cfg.type === 'string') {
        const value = (deserialize(raw) as string) ?? ''
        if (typeof value === 'string' && value.trim() !== '') {
          collected.push({ id: cfg.columnId, value })
        }
      } else {
        // default to array type
        const value = (deserialize(raw) as unknown[]) ?? []
        if (Array.isArray(value) && value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      }
    }
    return collected
  }, [columnFiltersCfg, search])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters)

  const pagination: PaginationState = useMemo(() => {
    const rawPage = search[pageKey]
    const rawPageSize = search[pageSizeKey]
    const pageNum = parsePositiveInt(rawPage, defaultPage)
    const pageSizeNum = parsePositiveInt(rawPageSize, defaultPageSize)
    console.log(pageNum, pageSizeNum)
    return {
      pageIndex: pageNum - 1,
      pageSize: pageSizeNum,
    }
  }, [search, pageKey, pageSizeKey, defaultPage, defaultPageSize])

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    const nextPage = next.pageIndex + 1
    const nextPageSize = next.pageSize
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (nextPage <= defaultPage) {
        next.delete(pageKey)
      } else {
        next.set(pageKey, nextPage.toString())
      }
      if (nextPageSize === defaultPageSize) {
        next.delete(pageSizeKey)
      } else {
        next.set(pageSizeKey, nextPageSize.toString())
      }
      return next
    })
  }

  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    const raw = (search as SearchRecord)[globalFilterKey]
    return typeof raw === 'string' ? raw : ''
  })

  const onGlobalFilterChange: OnChangeFn<string> | undefined = globalFilterEnabled
    ? (updater) => {
        const next = typeof updater === 'function' ? updater(globalFilter ?? '') : updater
        const value = trimGlobal ? next.trim() : next
        setGlobalFilter(value)
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete(pageKey)
          if (value) {
            next.set(globalFilterKey, value)
          } else {
            next.delete(globalFilterKey)
          }
          return next
        })
      }
    : undefined

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next = typeof updater === 'function' ? updater(columnFilters) : updater
    setColumnFilters(next)

    const patch: Record<string, unknown> = {}

    for (const cfg of columnFiltersCfg) {
      const found = next.find((f) => f.id === cfg.columnId)
      const serialize = cfg.serialize ?? ((v: unknown) => v)
      if (cfg.type === 'string') {
        const value = typeof found?.value === 'string' ? (found.value as string) : ''
        patch[cfg.searchKey] = value.trim() !== '' ? serialize(value) : undefined
      } else {
        const value = Array.isArray(found?.value) ? (found!.value as unknown[]) : []
        patch[cfg.searchKey] = value.length > 0 ? serialize(value) : undefined
      }
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete(pageKey)
      Object.entries(patch).forEach(([key, val]) => {
        if (val === undefined || val === null) {
          next.delete(key)
        } else {
          next.set(key, String(val))
        }
      })
      return next
    })
  }

  const ensurePageInRange = (
    pageCount: number,
    opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }
  ) => {
    const currentPage = (search as SearchRecord)[pageKey]
    const pageNum = typeof currentPage === 'number' ? currentPage : defaultPage
    if (pageCount > 0 && pageNum > pageCount) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (opts.resetTo === 'last') {
            next.set(pageKey, String(pageCount))
          } else {
            next.delete(pageKey)
          }
          return next
        },
        { replace: true }
      )
    }
  }

  return {
    globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  }
}

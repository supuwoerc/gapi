import { useMemo, useState } from 'react'

import type { ColumnFiltersState, OnChangeFn, PaginationState } from '@tanstack/react-table'

import { useSearchParams } from 'react-router'

type UseTableUrlStateParams = {
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
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  ensurePageInRange: (pageCount: number, opts?: { resetTo?: 'first' | 'last' }) => void
}

/**
 * 更新 URLSearchParams，undefined 值会删除对应 key
 */
function patchSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | number | undefined | null>
): URLSearchParams {
  const params = new URLSearchParams(current)
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
  }
  return params
}

export function useTableUrlState(params: UseTableUrlStateParams): UseTableUrlStateReturn {
  const {
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  const [searchParams, setSearchParams] = useSearchParams()

  const pageKey = paginationCfg?.pageKey ?? 'page'
  const pageSizeKey = paginationCfg?.pageSizeKey ?? 'pageSize'
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  const globalFilterKey = globalFilterCfg?.key ?? 'filter'
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  // ─── Column Filters ───────────────────────────────────────

  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      const raw = searchParams.get(cfg.searchKey)
      if (raw === null) continue

      const deserialize = cfg.deserialize ?? ((v: unknown) => v)

      if (cfg.type === 'array') {
        const arr = raw.split(',').filter(Boolean)
        const value = (deserialize(arr) as unknown[]) ?? []
        if (Array.isArray(value) && value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      } else {
        const value = (deserialize(raw) as string) ?? ''
        if (typeof value === 'string' && value.trim() !== '') {
          collected.push({ id: cfg.columnId, value })
        }
      }
    }
    return collected
     
  }, [searchParams, columnFiltersCfg])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters)

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next = typeof updater === 'function' ? updater(columnFilters) : updater
    setColumnFilters(next)

    const patch: Record<string, string | undefined> = {}
    patch[pageKey] = undefined // 筛选变化时重置页码

    for (const cfg of columnFiltersCfg) {
      const found = next.find((f) => f.id === cfg.columnId)
      const serialize = cfg.serialize ?? ((v: unknown) => v)

      if (cfg.type === 'array') {
        const value = Array.isArray(found?.value) ? (found!.value as unknown[]) : []
        patch[cfg.searchKey] = value.length > 0 ? String(serialize(value)) : undefined
      } else {
        const value = typeof found?.value === 'string' ? (found.value as string) : ''
        patch[cfg.searchKey] = value.trim() !== '' ? String(serialize(value)) : undefined
      }
    }

    setSearchParams(patchSearchParams(searchParams, patch), { replace: true })
  }

  // ─── Pagination ───────────────────────────────────────────

  const pagination: PaginationState = useMemo(() => {
    const rawPage = searchParams.get(pageKey)
    const rawPageSize = searchParams.get(pageSizeKey)
    const pageNum = rawPage !== null ? Number(rawPage) : defaultPage
    const pageSizeNum = rawPageSize !== null ? Number(rawPageSize) : defaultPageSize
    return {
      pageIndex: Math.max(0, (Number.isNaN(pageNum) ? defaultPage : pageNum) - 1),
      pageSize: Number.isNaN(pageSizeNum) ? defaultPageSize : pageSizeNum,
    }
  }, [searchParams, pageKey, pageSizeKey, defaultPage, defaultPageSize])

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    const nextPage = next.pageIndex + 1
    const nextPageSize = next.pageSize

    setSearchParams(
      patchSearchParams(searchParams, {
        [pageKey]: nextPage <= defaultPage ? undefined : nextPage,
        [pageSizeKey]: nextPageSize === defaultPageSize ? undefined : nextPageSize,
      }),
      { replace: true }
    )
  }

  // ─── Global Filter ────────────────────────────────────────

  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    return searchParams.get(globalFilterKey) ?? ''
  })

  const onGlobalFilterChange: OnChangeFn<string> | undefined = globalFilterEnabled
    ? (updater) => {
        const next = typeof updater === 'function' ? updater(globalFilter ?? '') : updater
        const value = trimGlobal ? next.trim() : next
        setGlobalFilter(value)

        setSearchParams(
          patchSearchParams(searchParams, {
            [pageKey]: undefined, // 搜索时重置页码
            [globalFilterKey]: value || undefined,
          }),
          { replace: true }
        )
      }
    : undefined

  // ─── Ensure Page In Range ─────────────────────────────────

  const ensurePageInRange = (
    pageCount: number,
    opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }
  ) => {
    const rawPage = searchParams.get(pageKey)
    const pageNum = rawPage !== null ? Number(rawPage) : defaultPage
    if (pageCount > 0 && pageNum > pageCount) {
      setSearchParams(
        patchSearchParams(searchParams, {
          [pageKey]: opts.resetTo === 'last' ? pageCount : undefined,
        }),
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

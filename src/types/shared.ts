export interface AdvancedFilter {
  id: string
  value: string | string[]
  variant: string
  operator: string
  filterId: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

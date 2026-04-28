import type { User } from '@/schema/admin/users'

export interface AdvancedFilter {
  id: string
  value: string | string[]
  variant: string
  operator: string
  filterId: string
}

export interface GetUsersParams {
  page: number
  perPage: number
  sort: { id: string; desc: boolean }[]
  username?: string
  status?: string[]
  role?: string[]
  filters?: string
}

export interface GetUsersResponse {
  data: User[]
  total: number
}

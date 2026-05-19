import type { Task } from '@/schema/tasks/tasks'

export interface AdvancedFilter {
  id: string
  value: string | string[]
  variant: string
  operator: string
  filterId: string
}

export interface GetTasksParams {
  page: number
  perPage: number
  sort: { id: string; desc: boolean }[]
  title?: string
  level?: string[]
  type?: string[]
  filters?: string
}

export interface GetTasksResponse {
  data: Task[]
  total: number
}

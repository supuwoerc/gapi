import { userListSchema } from '@/schema/user/user'
import type { User } from '@/schema/user/user'
import type { PaginatedResponse } from '@/types/shared'

import { del, get, patch } from '@/lib/http'

export interface GetUsersParams {
  page: number
  perPage: number
  sort: { id: string; desc: boolean }[]
  username?: string
  enabled?: boolean
  roles?: string[]
  filters?: string
}

export async function getUsers(params: GetUsersParams) {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.username) searchParams.username = params.username
  if (params.sort.length > 0) searchParams.sort = JSON.stringify(params.sort)
  if (params.filters) searchParams.filters = params.filters
  if (params.enabled !== undefined) searchParams.enabled = String(params.enabled)

  const arrayParams = new URLSearchParams(searchParams)
  params.roles?.forEach((v) => arrayParams.append('roles', v))

  const res = await get<PaginatedResponse<User>>('/users', { searchParams: arrayParams })
  return { ...res, data: userListSchema.parse(res.data) }
}

export async function deleteUsers(ids: number[]) {
  return del<null>('/users', { json: { ids } })
}

export async function updateUser(id: number, data: { enabled: boolean; roles: string[] }) {
  return patch<null>(`/users/${id}`, { json: data })
}

export async function getRoles(keyword?: string) {
  const searchParams: Record<string, string> = {}
  if (keyword) searchParams.keyword = keyword
  return get<{ id: number; code: string; name: string }[]>('/roles', { searchParams })
}

import { userListSchema } from '@/schema/user/user'
import type { User } from '@/schema/user/user'
import type { PaginatedResponse } from '@/types/shared'

import { get } from '@/lib/http'

export interface GetUsersParams {
  page: number
  perPage: number
  sort: { id: string; desc: boolean }[]
  username?: string
  status?: string[]
  role?: string[]
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

  const arrayParams = new URLSearchParams(searchParams)
  params.status?.forEach((v) => arrayParams.append('status', v))
  params.role?.forEach((v) => arrayParams.append('role', v))

  const res = await get<PaginatedResponse<User>>('/users', { searchParams: arrayParams })
  return { ...res, data: userListSchema.parse(res.data) }
}

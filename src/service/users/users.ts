import { userListSchema } from '@/schema/admin/users'

import { get } from '@/lib/http'
import { patch } from '@/lib/http'

import type {
  GetUsersParams,
  GetUsersResponse,
  PatchTourParams,
  PatchTourResponse,
} from './dto/users'

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

  const res = await get<GetUsersResponse>('/users', { searchParams: arrayParams })
  return { ...res, data: userListSchema.parse(res.data) }
}

export function patchTour(params: PatchTourParams) {
  return patch<PatchTourResponse>('/tour', { json: params })
}

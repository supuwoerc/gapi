import { z } from 'zod'

import {
  permissionDetailSchema,
  permissionListSchema,
  permissionRoleOptionListSchema,
} from '@/schema/admin/permission'
import type {
  Permission,
  PermissionAction,
  PermissionMutation,
  PermissionRoleOption,
  ResourceType,
} from '@/schema/admin/permission'
import type { PaginatedResponse } from '@/types/shared'

import { del, get, patch, post } from '@/lib/http'

export interface GetPermissionsParams {
  page: number
  perPage: number
  keyword?: string
  module?: string
  action?: PermissionAction
  resource_type?: ResourceType
}

export async function getPermissions(
  params: GetPermissionsParams
): Promise<PaginatedResponse<Permission>> {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.keyword) searchParams.keyword = params.keyword
  if (params.module) searchParams.module = params.module
  if (params.action) searchParams.action = params.action
  if (params.resource_type) searchParams.resource_type = String(params.resource_type)

  const res = await get<PaginatedResponse<Permission>>('/permissions', { searchParams })
  return { data: permissionListSchema.parse(res.data), total: res.total }
}

export async function getPermissionDetail(id: number) {
  const res = await get<unknown>(`/permissions/${id}`)
  return permissionDetailSchema.parse(res)
}

export async function createPermission(data: PermissionMutation) {
  return post<null>('/permissions', { json: data })
}

export async function updatePermission(id: number, data: PermissionMutation) {
  return patch<null>(`/permissions/${id}`, { json: data })
}

export async function deletePermissions(ids: number[]) {
  return del<null>('/permissions', { json: { ids } })
}

export async function getPermissionModules(): Promise<string[]> {
  const res = await get<string[]>('/permissions/modules')
  return z.array(z.string()).parse(res)
}

export async function getRoleOptions(keyword?: string): Promise<PermissionRoleOption[]> {
  const searchParams: Record<string, string> = {}
  if (keyword) searchParams.keyword = keyword

  const res = await get<unknown>('/roles', { searchParams })
  return permissionRoleOptionListSchema.parse(res)
}

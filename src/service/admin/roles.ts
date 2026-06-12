import { z } from 'zod'

import { permissionListSchema } from '@/schema/admin/permission'
import type { Permission } from '@/schema/admin/permission'
import type { PermissionAction, ResourceType } from '@/schema/admin/permission'
import { roleSchema, roleTreeListSchema } from '@/schema/admin/role'
import type { Role, RoleMutation, RoleTree } from '@/schema/admin/role'
import type { PaginatedResponse } from '@/types/shared'

import { del, get, patch, post } from '@/lib/http'

export interface GetRolesParams {
  page: number
  perPage: number
  keyword?: string
  enabled?: boolean
}

export async function getRoles(params: GetRolesParams): Promise<PaginatedResponse<RoleTree>> {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.keyword) searchParams.keyword = params.keyword
  if (params.enabled !== undefined) searchParams.enabled = String(params.enabled)

  const res = await get<PaginatedResponse<RoleTree>>('/roles', { searchParams })
  return { data: withEffectivePermissions(roleTreeListSchema.parse(res.data)), total: res.total }
}

export async function getRoleDetail(id: number): Promise<Role> {
  const res = await get<Role>(`/roles/${id}`)
  return roleSchema.parse(res)
}

export function withEffectivePermissions(roles: RoleTree[]): RoleTree[] {
  const applyInheritance = (
    role: RoleTree,
    inheritedPermissions = new Map<number, RoleTree['permissions'][number]>()
  ): RoleTree => {
    const effectivePermissionMap = new Map(inheritedPermissions)

    for (const permission of role.permissions) {
      effectivePermissionMap.set(permission.id, permission)
    }

    const effective_permissions = Array.from(effectivePermissionMap.values())

    return {
      ...role,
      effective_permissions,
      children: role.children.map((child) => applyInheritance(child, effectivePermissionMap)),
    }
  }

  return roles.map((role) => applyInheritance(role))
}

export async function createRole(data: RoleMutation) {
  return post<null>('/roles', { json: data })
}

export async function updateRole(id: number, data: RoleMutation) {
  return patch<null>(`/roles/${id}`, { json: data })
}

export async function deleteRoles(ids: number[]) {
  return del<null>('/roles', { json: { ids } })
}

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

export async function getPermissionModules(): Promise<string[]> {
  const res = await get<string[]>('/permissions/modules')
  return z.array(z.string()).parse(res)
}

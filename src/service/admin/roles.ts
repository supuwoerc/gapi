import { permissionListSchema } from '@/schema/admin/permission'
import type { Permission } from '@/schema/admin/permission'
import { roleTreeListSchema } from '@/schema/admin/role'
import type { RoleMutation, RoleTree } from '@/schema/admin/role'

import { del, get, patch, post } from '@/lib/http'

export interface GetRolesTreeParams {
  keyword?: string
  enabled?: boolean
}

export async function getRolesTree(params: GetRolesTreeParams = {}): Promise<RoleTree[]> {
  const searchParams: Record<string, string> = {}
  if (params.keyword) searchParams.keyword = params.keyword
  if (params.enabled !== undefined) searchParams.enabled = String(params.enabled)

  const res = await get<RoleTree[]>('/roles/tree', { searchParams })
  return withEffectivePermissions(roleTreeListSchema.parse(res))
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

export async function getPermissions(): Promise<Permission[]> {
  const res = await get<Permission[]>('/permissions')
  return permissionListSchema.parse(res)
}

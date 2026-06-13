import type { Permission, PermissionMutation } from '@/schema/admin/permission'
import type { RoleTree } from '@/schema/admin/role'
import { delay, http } from 'msw'

import { permissions } from '../data/permissions'
import { roles } from '../data/roles'
import { paginate } from '../utils/filter'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

function flattenRoles(items: RoleTree[]): RoleTree[] {
  return items.flatMap((role) => [role, ...flattenRoles(role.children)])
}

function sortPermissions() {
  return [...permissions].sort(
    (a, b) =>
      a.module.localeCompare(b.module) ||
      a.resource_path.localeCompare(b.resource_path) ||
      a.action.localeCompare(b.action) ||
      a.id - b.id
  )
}

function getNextPermissionId() {
  return Math.max(0, ...permissions.map((permission) => permission.id)) + 1
}

function getPermissionRoles(permissionId: number) {
  return flattenRoles(roles).flatMap((role) => {
    const permission = role.permissions.find((item) => item.id === permissionId)
    if (!permission) return []

    return [
      {
        id: role.id,
        code: role.code,
        name: role.name,
        effect: permission.effect,
      },
    ]
  })
}

function toPermissionDetail(permission: Permission) {
  return {
    ...permission,
    roles: getPermissionRoles(permission.id),
  }
}

function applyPermissionRoles(permission: Permission, assignments: PermissionMutation['roles']) {
  const effectByRoleId = new Map(
    assignments.map((assignment) => [assignment.role_id, assignment.effect])
  )

  const applyRole = (items: RoleTree[]) => {
    items.forEach((role) => {
      const effect = effectByRoleId.get(role.id)
      role.permissions = role.permissions.filter((item) => item.id !== permission.id)

      if (effect) {
        role.permissions.push({ ...permission, effect })
      }

      applyRole(role.children)
    })
  }

  applyRole(roles)
}

function buildPermission(payload: PermissionMutation, id = getNextPermissionId()): Permission {
  const now = new Date()
  return {
    id,
    code: payload.code,
    name: payload.name,
    resource_type: payload.resource_type,
    module: payload.module,
    resource_path: payload.resource_path,
    action: payload.action,
    description: payload.description,
    created_at: now,
    updated_at: now,
  }
}

export const permissionHandlers = [
  http.get(`${BASE}/permissions/modules`, async () => {
    await delay(200)
    return jsonEnvelope(
      Array.from(new Set(permissions.map((permission) => permission.module))).sort()
    )
  }),

  http.get(`${BASE}/permissions/:id`, async ({ params }) => {
    await delay(200)
    const id = Number(params.id)
    const permission = permissions.find((item) => item.id === id)
    return jsonEnvelope(permission ? toPermissionDetail(permission) : null)
  }),

  http.get(`${BASE}/permissions`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 20)
    const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? ''
    const module = url.searchParams.get('module')
    const action = url.searchParams.get('action')
    const resourceType = url.searchParams.get('resource_type')

    let result = sortPermissions()

    if (keyword) {
      result = result.filter((permission) =>
        [permission.name, permission.description].join(' ').toLowerCase().includes(keyword)
      )
    }

    if (module) {
      result = result.filter((permission) => permission.module === module)
    }

    if (action) {
      result = result.filter((permission) => permission.action === action)
    }

    if (resourceType) {
      result = result.filter((permission) => String(permission.resource_type) === resourceType)
    }

    return jsonEnvelope(paginate(result, page, perPage))
  }),

  http.post(`${BASE}/permissions`, async ({ request }) => {
    await delay(300)
    const payload = (await request.json()) as PermissionMutation
    const permission = buildPermission(payload)
    permissions.push(permission)
    applyPermissionRoles(permission, payload.roles)
    return jsonEnvelope(null)
  }),

  http.patch(`${BASE}/permissions/:id`, async ({ params, request }) => {
    await delay(300)
    const id = Number(params.id)
    const payload = (await request.json()) as PermissionMutation
    const index = permissions.findIndex((permission) => permission.id === id)
    if (index === -1) return jsonEnvelope(null)

    const permission = {
      ...buildPermission(payload, id),
      created_at: permissions[index].created_at,
    }
    permissions[index] = permission
    applyPermissionRoles(permission, payload.roles)
    return jsonEnvelope(null)
  }),

  http.delete(`${BASE}/permissions`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { ids: number[] }
    const ids = new Set(body.ids)
    const nextPermissions = permissions.filter((permission) => !ids.has(permission.id))
    permissions.splice(0, permissions.length, ...nextPermissions)

    const removePermission = (items: RoleTree[]) => {
      items.forEach((role) => {
        role.permissions = role.permissions.filter((permission) => !ids.has(permission.id))
        removePermission(role.children)
      })
    }

    removePermission(roles)
    return jsonEnvelope(null)
  }),
]

import type { Role, RoleMutation, RoleTree } from '@/schema/admin/role'
import { withEffectivePermissions } from '@/service/admin/roles'
import { delay, http } from 'msw'

import { permissions } from '../data/permissions'
import { roles } from '../data/roles'
import { paginate } from '../utils/filter'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

function flattenRoles(items: RoleTree[]): RoleTree[] {
  return items.flatMap((role) => [role, ...flattenRoles(role.children)])
}

function cloneRole(role: RoleTree): RoleTree {
  return {
    ...role,
    permissions: [...role.permissions],
    effective_permissions: [...(role.effective_permissions ?? role.permissions)],
    children: role.children.map(cloneRole),
  }
}

function roleMatches(role: RoleTree, keyword: string, enabled: string | null): boolean {
  const normalizedKeyword = keyword.toLowerCase()
  const matchesKeyword =
    !normalizedKeyword ||
    role.name.toLowerCase().includes(normalizedKeyword) ||
    role.code.toLowerCase().includes(normalizedKeyword)
  const matchesEnabled = enabled === null || role.enabled === (enabled === 'true')

  return matchesKeyword && matchesEnabled
}

function filterRoleTree(items: RoleTree[], keyword: string, enabled: string | null): RoleTree[] {
  return items.flatMap((role) => {
    const children = filterRoleTree(role.children, keyword, enabled)
    if (roleMatches(role, keyword, enabled) || children.length > 0) {
      return [{ ...cloneRole(role), children }]
    }
    return []
  })
}

function findRole(items: RoleTree[], id: number): RoleTree | undefined {
  for (const role of items) {
    if (role.id === id) return role
    const child = findRole(role.children, id)
    if (child) return child
  }
}

function removeRoles(items: RoleTree[], ids: Set<number>): RoleTree[] {
  return items
    .filter((role) => !ids.has(role.id))
    .map((role) => ({ ...role, children: removeRoles(role.children, ids) }))
}

function getNextRoleId() {
  return Math.max(0, ...flattenRoles(roles).map((role) => role.id)) + 1
}

function buildRole(payload: RoleMutation, id = getNextRoleId()): RoleTree {
  const now = new Date()
  const assignmentByPermissionId = new Map(
    payload.permissions.map((assignment) => [assignment.permission_id, assignment.effect])
  )
  return {
    id,
    name: payload.name,
    code: payload.code,
    parent_id: payload.parent_id,
    description: payload.description,
    sort_order: payload.sort_order,
    enabled: payload.enabled,
    permissions: permissions
      .filter((permission) => assignmentByPermissionId.has(permission.id))
      .map((permission) => ({
        ...permission,
        effect: assignmentByPermissionId.get(permission.id) ?? 'allow',
      })),
    created_at: now,
    updated_at: now,
    children: [],
  }
}

function insertRole(role: RoleTree) {
  if (role.parent_id === null) {
    roles.push(role)
    return
  }

  const parent = findRole(roles, role.parent_id)
  if (parent) {
    parent.children.push(role)
  } else {
    roles.push({ ...role, parent_id: null })
  }
}

function sortRoleTree(items: RoleTree[]): RoleTree[] {
  return [...items]
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((role) => ({ ...role, children: sortRoleTree(role.children) }))
}

function toRoleDetail(role: RoleTree): Role {
  const { children: _children, ...detail } = cloneRole(role)
  return detail
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

export const roleHandlers = [
  http.get(`${BASE}/roles`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)

    if (url.searchParams.has('page') || url.searchParams.has('perPage')) {
      const page = Number(url.searchParams.get('page') ?? 1)
      const perPage = Number(url.searchParams.get('perPage') ?? 20)
      const keyword = url.searchParams.get('keyword') ?? ''
      const enabled = url.searchParams.get('enabled')
      const result = withEffectivePermissions(sortRoleTree(filterRoleTree(roles, keyword, enabled)))

      return jsonEnvelope(paginate(result, page, perPage))
    }

    const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? ''
    const result = flattenRoles(roles)
      .filter(
        (role) =>
          !keyword ||
          role.name.toLowerCase().includes(keyword) ||
          role.code.toLowerCase().includes(keyword)
      )
      .map((role) => ({ id: role.id, code: role.code, name: role.name }))
    return jsonEnvelope(result)
  }),

  http.get(`${BASE}/roles/:id`, async ({ params }) => {
    await delay(200)
    const id = Number(params.id)
    const role = findRole(withEffectivePermissions(sortRoleTree(roles)), id)
    return jsonEnvelope(role ? toRoleDetail(role) : null)
  }),

  http.post(`${BASE}/roles`, async ({ request }) => {
    await delay(300)
    const payload = (await request.json()) as RoleMutation
    insertRole(buildRole(payload))
    return jsonEnvelope(null)
  }),

  http.patch(`${BASE}/roles/:id`, async ({ params, request }) => {
    await delay(300)
    const id = Number(params.id)
    const payload = (await request.json()) as RoleMutation
    const oldRole = findRole(roles, id)
    if (!oldRole) return jsonEnvelope(null)

    const children = oldRole.children
    const createdAt = oldRole.created_at
    const ids = new Set([id])
    const rootRoles = removeRoles(roles, ids)
    roles.splice(0, roles.length, ...rootRoles)

    const nextRole = buildRole(payload, id)
    nextRole.children = children
    nextRole.created_at = createdAt
    insertRole(nextRole)
    return jsonEnvelope(null)
  }),

  http.delete(`${BASE}/roles`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { ids: number[] }
    const nextRoles = removeRoles(roles, new Set(body.ids))
    roles.splice(0, roles.length, ...nextRoles)
    return jsonEnvelope(null)
  }),

  http.get(`${BASE}/permissions/modules`, async () => {
    await delay(200)
    return jsonEnvelope(
      Array.from(new Set(permissions.map((permission) => permission.module))).sort()
    )
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
        [
          permission.name,
          permission.code,
          permission.module,
          permission.resource_path,
          permission.action,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
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
]

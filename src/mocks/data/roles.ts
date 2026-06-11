import type { RolePermission } from '@/schema/admin/permission'
import type { RoleTree } from '@/schema/admin/role'

import { permissions } from './permissions'

const createdAt = '2026-05-01T08:00:00.000Z'
const updatedAt = '2026-06-01T08:00:00.000Z'

function pickPermissions(ids: number[], denyIds: number[] = []): RolePermission[] {
  return permissions
    .filter((permission) => ids.includes(permission.id))
    .map((permission) => ({
      ...permission,
      effect: denyIds.includes(permission.id) ? 'deny' : 'allow',
    }))
}

export const roles: RoleTree[] = [
  {
    id: 1,
    name: 'Super Admin',
    code: 'superadmin',
    parent_id: null,
    description: 'Full administrative access across every module.',
    sort_order: 10,
    enabled: true,
    permissions: pickPermissions([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    created_at: new Date(createdAt),
    updated_at: new Date(updatedAt),
    children: [
      {
        id: 2,
        name: 'Admin',
        code: 'admin',
        parent_id: 1,
        description: 'Administrative access for user, role, and operations management.',
        sort_order: 20,
        enabled: true,
        permissions: pickPermissions([1, 2, 3, 4, 5, 6, 7, 8]),
        created_at: new Date(createdAt),
        updated_at: new Date(updatedAt),
        children: [
          {
            id: 3,
            name: 'Manager',
            code: 'manager',
            parent_id: 2,
            description: 'Team management role with task and project visibility.',
            sort_order: 30,
            enabled: true,
            permissions: pickPermissions([6, 7, 8, 9, 10], [7]),
            created_at: new Date(createdAt),
            updated_at: new Date(updatedAt),
            children: [
              {
                id: 4,
                name: 'Cashier',
                code: 'cashier',
                parent_id: 3,
                description: 'Frontline operational role with focused read access.',
                sort_order: 40,
                enabled: true,
                permissions: pickPermissions([6, 8]),
                created_at: new Date(createdAt),
                updated_at: new Date(updatedAt),
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Auditor',
    code: 'auditor',
    parent_id: null,
    description: 'Read-only audit role for compliance review.',
    sort_order: 50,
    enabled: false,
    permissions: pickPermissions([1, 2, 3, 4, 5, 6, 8, 9, 10], [2, 4]),
    created_at: new Date(createdAt),
    updated_at: new Date(updatedAt),
    children: [],
  },
]

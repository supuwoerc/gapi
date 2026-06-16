import type { Permission, PermissionAction } from '@/schema/admin/permission'

const now = '2026-06-01T08:00:00.000Z'

const basePermissions: Permission[] = [
  {
    id: 1,
    code: 'admin:users:read',
    name: 'View Users',
    resource_type: 3,
    module: 'admin',
    resource_path: '/admin/users',
    action: 'read',
    description: 'View user list and details',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 2,
    code: 'admin:users:write',
    name: 'Manage Users',
    resource_type: 4,
    module: 'admin',
    resource_path: '/admin/users',
    action: 'update',
    description: 'Create, update, and delete users',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 3,
    code: 'admin:roles:read',
    name: 'View Roles',
    resource_type: 3,
    module: 'admin',
    resource_path: '/admin/roles',
    action: 'read',
    description: 'View role hierarchy and role details',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 4,
    code: 'admin:roles:write',
    name: 'Manage Roles',
    resource_type: 4,
    module: 'admin',
    resource_path: '/admin/roles',
    action: 'update',
    description: 'Create, update, and delete roles',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 5,
    code: 'admin:permissions:read',
    name: 'View Permissions',
    resource_type: 3,
    module: 'admin',
    resource_path: '/admin/permissions',
    action: 'read',
    description: 'View permission catalog',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 6,
    code: 'tasks:read',
    name: 'View Tasks',
    resource_type: 3,
    module: 'tasks',
    resource_path: '/tasks',
    action: 'read',
    description: 'View task list and task detail',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 7,
    code: 'tasks:edit',
    name: 'Update Tasks',
    resource_type: 4,
    module: 'tasks',
    resource_path: '/tasks',
    action: 'update',
    description: 'Update task assignment and status',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 8,
    code: 'notifications:read',
    name: 'View Notifications',
    resource_type: 3,
    module: 'notifications',
    resource_path: '/notifications',
    action: 'read',
    description: 'View notifications',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 9,
    code: 'projects:read',
    name: 'View Projects',
    resource_type: 3,
    module: 'projects',
    resource_path: '/projects',
    action: 'read',
    description: 'View project workspace',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
  {
    id: 10,
    code: 'documents:read',
    name: 'View Documents',
    resource_type: 3,
    module: 'documents',
    resource_path: '/documents',
    action: 'read',
    description: 'View document repository',
    created_at: new Date(now),
    updated_at: new Date(now),
  },
]

const generatedModules = [
  {
    module: 'admin',
    resources: ['settings', 'audit-logs', 'menus', 'system-config'],
  },
  {
    module: 'tasks',
    resources: ['comments', 'attachments', 'workflow', 'reports'],
  },
  {
    module: 'projects',
    resources: ['members', 'settings', 'milestones', 'documents'],
  },
  {
    module: 'documents',
    resources: ['folders', 'versions', 'shares', 'templates'],
  },
  {
    module: 'notifications',
    resources: ['channels', 'templates', 'subscriptions', 'delivery-logs'],
  },
]

const generatedActions: PermissionAction[] = ['read', 'create', 'update', 'delete']

function titleCase(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function actionLabel(action: PermissionAction) {
  if (action === 'read') return 'View'
  if (action === 'create') return 'Create'
  if (action === 'update') return 'Update'
  return 'Delete'
}

function buildGeneratedPermissions(): Permission[] {
  let nextId = Math.max(...basePermissions.map((permission) => permission.id)) + 1

  return generatedModules.flatMap(({ module, resources }) =>
    resources.flatMap((resource) =>
      generatedActions.map((action) => ({
        id: nextId++,
        code: `${module}:${resource}:${action}`,
        name: `${actionLabel(action)} ${titleCase(resource)}`,
        resource_type: action === 'read' ? 3 : 4,
        module,
        resource_path: `/${module}/${resource}`,
        action,
        description: `${actionLabel(action)} ${titleCase(resource)} in ${module}`,
        created_at: new Date(now),
        updated_at: new Date(now),
      }))
    )
  )
}

export const permissions: Permission[] = [...basePermissions, ...buildGeneratedPermissions()]

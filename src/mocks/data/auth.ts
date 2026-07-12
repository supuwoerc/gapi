import { faker } from '@faker-js/faker'

import { users } from './users'

const mockLoginUser = users[0]

export const modulePermissionsMap: Record<string, string[]> = {
  dashboard: ['dashboard:read', 'dashboard:edit'],
  tasks: ['tasks:read', 'tasks:create', 'tasks:edit', 'tasks:delete'],
  notifications: ['notifications:read', 'notifications:manage'],
  projects: ['projects:read', 'projects:create', 'projects:edit', 'projects:delete'],
  documents: ['documents:read', 'documents:create', 'documents:edit', 'documents:delete'],
  workflow: ['workflow:read'],
  admin: [
    'admin:users:read',
    'admin:users:write',
    'admin:roles:read',
    'admin:roles:write',
    'admin:permissions:read',
    'admin:permissions:write',
  ],
}

export function generateLoginResponse(email?: string) {
  return {
    user: {
      id: mockLoginUser.id,
      name: mockLoginUser.username,
      email: email ?? mockLoginUser.email,
      avatar: mockLoginUser.avatar,
      bio: mockLoginUser.bio,
    },
    token: faker.string.alphanumeric(64),
    refresh_token: faker.string.alphanumeric(64),
    role: ['admin'],
    menu_permissions: [
      'dashboard',
      'tasks',
      'notifications',
      'projects',
      'documents',
      'workflow',
      'admin',
      'admin:users',
      'admin:roles',
      'admin:permissions',
    ],
    route_permissions: [
      'dashboard',
      'tasks',
      'notifications',
      'projects',
      'documents',
      'workflow',
      'admin',
      'admin:users',
      'admin:roles',
      'admin:permissions',
    ],
    completed_tours: [],
  }
}

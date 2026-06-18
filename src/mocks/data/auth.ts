import { faker } from '@faker-js/faker'

export const modulePermissionsMap: Record<string, string[]> = {
  dashboard: ['dashboard:read', 'dashboard:edit'],
  tasks: ['tasks:read', 'tasks:create', 'tasks:edit', 'tasks:delete'],
  notifications: ['notifications:read', 'notifications:manage'],
  projects: ['projects:read', 'projects:create', 'projects:edit', 'projects:delete'],
  documents: ['documents:read', 'documents:create', 'documents:edit', 'documents:delete'],
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
      name: faker.person.fullName(),
      email: email ?? faker.internet.email(),
      avatar: faker.image.avatar(),
      bio: faker.lorem.sentence({ min: 3, max: 8 }),
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

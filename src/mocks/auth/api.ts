import type {
  FetchPermissionsParams,
  FetchPermissionsResponse,
  ForgotPasswordParams,
  LoginParams,
  LoginResponse,
  SignUpParams,
  VerifyOtpParams,
} from '@/service/auth/dto/auth'
import { faker } from '@faker-js/faker'

export async function login(params: LoginParams): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 1000))
  return {
    user: {
      name: faker.person.fullName(),
      email: params.email,
      avatar: faker.image.avatar(),
    },
    token: faker.string.alphanumeric(64),
    refreshToken: faker.string.alphanumeric(64),
    role: ['admin'],
    menuPermissions: [
      'dashboard',
      'tasks',
      'notifications',
      'groups',
      'projects',
      'documents',
      'admin',
      'admin:users',
      'admin:roles',
      'admin:permissions',
    ],
  }
}

export async function forgotPassword(_params: ForgotPasswordParams): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000))
}

export async function verifyOtp(_params: VerifyOtpParams): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000))
}

export async function signUp(_params: SignUpParams): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000))
}

const modulePermissionsMap: Record<string, string[]> = {
  dashboard: ['dashboard:read', 'dashboard:edit'],
  tasks: ['tasks:read', 'tasks:create', 'tasks:edit', 'tasks:delete'],
  notifications: ['notifications:read', 'notifications:manage'],
  groups: ['groups:read', 'groups:create', 'groups:edit'],
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

export async function fetchPermissions(
  params: FetchPermissionsParams
): Promise<FetchPermissionsResponse> {
  await new Promise((r) => setTimeout(r, 300))
  return {
    permissions: modulePermissionsMap[params.module] ?? [],
  }
}

export async function fetchUserProfile(): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 300))
  return {
    user: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
    },
    token: faker.string.alphanumeric(64),
    refreshToken: faker.string.alphanumeric(64),
    role: ['admin'],
    menuPermissions: [
      'dashboard',
      'tasks',
      'notifications',
      'groups',
      'projects',
      'documents',
      'admin',
      'admin:users',
      'admin:roles',
      'admin:permissions',
    ],
  }
}

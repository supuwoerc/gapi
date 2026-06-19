import { delay, http } from 'msw'

import { generateLoginResponse, modulePermissionsMap } from '../data/auth'
import {
  currentProjectUser,
  projectMembers,
  projectRolePermissions,
  projects,
} from '../data/projects'
import { errorEnvelope, jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(1000)
    const body = (await request.json()) as { email: string }
    return jsonEnvelope(generateLoginResponse(body.email))
  }),

  http.post(`${BASE}/auth/forgot-password`, async () => {
    await delay(1000)
    return jsonEnvelope(null)
  }),

  http.post(`${BASE}/auth/verify-otp`, async () => {
    await delay(1000)
    return jsonEnvelope(null)
  }),

  http.post(`${BASE}/auth/sign-up`, async ({ request }) => {
    await delay(1000)
    const body = (await request.json()) as { captcha_token?: string }
    if (!body.captcha_token) {
      return errorEnvelope(400001, 'captcha_token is required')
    }
    return jsonEnvelope(null)
  }),

  http.post(`${BASE}/auth/refresh`, async () => {
    await delay(300)
    const { faker } = await import('@faker-js/faker')
    return jsonEnvelope({
      token: faker.string.alphanumeric(64),
      refresh_token: faker.string.alphanumeric(64),
    })
  }),

  http.get(`${BASE}/auth/permissions`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const module = url.searchParams.get('module') ?? ''
    const projectId = url.searchParams.get('projectId')

    if (projectId) {
      const numericProjectId = Number(projectId)
      const project = projects.find((p) => p.id === numericProjectId)

      const membership = projectMembers.find(
        (m) =>
          m.project_id === numericProjectId &&
          m.user.id === currentProjectUser.id &&
          m.status === 'active'
      )

      if (!membership) {
        if (project?.visibility === 'public') {
          return jsonEnvelope({ permissions: [`${module}:read`] })
        }
        return jsonEnvelope({ permissions: [] })
      }

      const rolePerms = projectRolePermissions.filter(
        (p) =>
          p.project_role_id === membership.project_role_id &&
          p.module === module &&
          p.effect === 'allow'
      )
      return jsonEnvelope({ permissions: rolePerms.map((p) => `${p.module}:${p.action}`) })
    }

    return jsonEnvelope({ permissions: modulePermissionsMap[module] ?? [] })
  }),
]

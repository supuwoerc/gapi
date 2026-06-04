import { delay, http } from 'msw'

import { generateLoginResponse, modulePermissionsMap } from '../data/auth'
import { jsonEnvelope } from '../utils/response'

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

  http.post(`${BASE}/auth/sign-up`, async () => {
    await delay(1000)
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
    return jsonEnvelope({ permissions: modulePermissionsMap[module] ?? [] })
  }),

  http.get(`${BASE}/auth/profile`, async () => {
    await delay(300)
    return jsonEnvelope(generateLoginResponse())
  }),
]

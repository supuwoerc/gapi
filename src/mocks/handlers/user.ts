import { delay, http } from 'msw'

import { generateLoginResponse } from '../data/auth'
import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const userProfileHandlers = [
  http.get(`${BASE}/user/profile`, async () => {
    await delay(300)
    return jsonEnvelope(generateLoginResponse())
  }),

  http.patch(`${BASE}/user/profile`, async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as { name: string; bio: string; avatar?: string }
    return jsonEnvelope({
      name: body.name,
      email: 'mock@example.com',
      avatar: body.avatar ?? 'https://github.com/shadcn.png',
      bio: body.bio,
    })
  }),

  http.patch(`${BASE}/user/tour`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { completed_tours: string[] }
    return jsonEnvelope({ completed_tours: body.completed_tours })
  }),
]

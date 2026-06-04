import { delay, http } from 'msw'

import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const profileHandlers = [
  http.patch(`${BASE}/profile`, async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as { name: string; bio: string; avatar?: string }
    return jsonEnvelope({
      name: body.name,
      email: 'mock@example.com',
      avatar: body.avatar ?? 'https://github.com/shadcn.png',
      bio: body.bio,
    })
  }),
]

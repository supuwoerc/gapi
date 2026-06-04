import { delay, http } from 'msw'

import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const tourHandlers = [
  http.patch(`${BASE}/tour`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { completed_tours: string[] }
    return jsonEnvelope({ completed_tours: body.completed_tours })
  }),
]

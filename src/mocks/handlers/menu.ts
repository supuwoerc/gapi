import { faker } from '@faker-js/faker'
import { delay, http } from 'msw'

import { jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const menuHandlers = [
  http.get(`${BASE}/menu/badges`, async () => {
    await delay(500)
    return jsonEnvelope({
      dashboard: faker.number.int({ min: 0, max: 200 }),
      tasks: faker.number.int({ min: 0, max: 20 }),
      notifications: faker.number.int({ min: 0, max: 99 }),
    })
  }),
]

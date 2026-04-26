import { faker } from '@faker-js/faker'

export type FetchMenuBadgesResponse = Record<string, number>

export async function fetchMenuBadges(): Promise<FetchMenuBadgesResponse> {
  await new Promise((r) => setTimeout(r, 500))
  return {
    dashboard: faker.number.int({ min: 0, max: 200 }),
    tasks: faker.number.int({ min: 0, max: 20 }),
    notifications: faker.number.int({ min: 0, max: 99 }),
  }
}

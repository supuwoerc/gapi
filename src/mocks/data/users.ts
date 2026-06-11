import { faker } from '@faker-js/faker'

import { roles } from './roles'

faker.seed(67890)

function flattenRoles(items: typeof roles): { id: number; code: string; name: string }[] {
  return items.flatMap((role) => [
    { id: role.id, code: role.code, name: role.name },
    ...flattenRoles(role.children),
  ])
}

export const predefinedRoles = flattenRoles(roles)

export const users = Array.from({ length: 500 }, () => {
  const roleCount = faker.number.int({ min: 1, max: 3 })
  const roles = faker.helpers.arrayElements(predefinedRoles, roleCount)

  return {
    id: faker.number.int({ min: 1, max: 100000 }),
    username: faker.internet.username().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    avatar: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    enabled: faker.datatype.boolean({ probability: 0.8 }),
    last_login_at:
      faker.helpers.maybe(() => faker.date.recent().toISOString(), {
        probability: 0.7,
      }) ?? null,
    login_fail_count: faker.number.int({ min: 0, max: 5 }),
    locked_until:
      faker.helpers.maybe(() => faker.date.future().toISOString(), {
        probability: 0.1,
      }) ?? null,
    roles,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
  }
})

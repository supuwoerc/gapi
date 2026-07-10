import { faker } from '@faker-js/faker'

import { users } from './users'

faker.seed(12345)

function createTaskUser() {
  const user = faker.helpers.arrayElement(users)

  return {
    id: user.id,
    name: user.username,
    email: user.email,
    avatar: user.avatar,
  }
}

export const tasks = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  level: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'] as const),
  type: faker.helpers.arrayElement(['bug', 'feature', 'improvement', 'task'] as const),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  creator: createTaskUser(),
  assignee: createTaskUser(),
  resolver: faker.helpers.maybe(createTaskUser, { probability: 0.7 }) ?? null,
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
  deleted_at: null,
}))

import { faker } from '@faker-js/faker'

faker.seed(12345)

export const tasks = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  level: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'] as const),
  type: faker.helpers.arrayElement(['bug', 'feature', 'improvement', 'task'] as const),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  creator: faker.person.fullName(),
  assignee: faker.person.fullName(),
  resolver: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.7 }) ?? '',
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
  deleted_at: null,
}))

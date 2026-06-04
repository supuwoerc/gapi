import { faker } from '@faker-js/faker'

faker.seed(54321)

export const notifications = Array.from({ length: 200 }, (_, i) => {
  const type = faker.helpers.arrayElement(['system', 'task', 'message', 'alert'] as const)
  return {
    id: i + 1,
    title: faker.lorem.sentence({ min: 3, max: 10 }),
    content: faker.lorem.paragraphs({ min: 2, max: 5 }),
    type,
    sender: faker.person.fullName(),
    is_read: faker.datatype.boolean({ probability: 0.4 }),
    created_at: faker.date.recent({ days: 30 }),
    source: type !== 'system' ? `/task/${faker.number.int({ min: 1, max: 500 })}` : undefined,
  }
})

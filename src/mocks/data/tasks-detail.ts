import type { CommentAttachment } from '@/schema/tasks/detail'
import { faker } from '@faker-js/faker'

faker.seed(54321)

const timelineActions = ['created', 'assigned', 'level_changed', 'commented', 'resolved'] as const

const timelineCache = new Map<number, ReturnType<typeof generateTimelineForTask>>()
const commentsCache = new Map<number, ReturnType<typeof generateCommentsForTask>>()
const descriptions = new Map<number, string>()

const sampleImageUrls = [
  'https://picsum.photos/seed/a1/800/600',
  'https://picsum.photos/seed/b2/800/600',
  'https://picsum.photos/seed/c3/800/600',
]

function generateAttachments(seed: number): CommentAttachment[] {
  faker.seed(seed)
  const hasAttachments = faker.datatype.boolean({ probability: 0.3 })
  if (!hasAttachments) return []

  const count = faker.number.int({ min: 1, max: 3 })
  const attachments: CommentAttachment[] = []

  for (let i = 0; i < count; i++) {
    const isImage = faker.datatype.boolean({ probability: 0.6 })
    if (isImage) {
      attachments.push({
        id: seed * 100 + i,
        file_name: `${faker.word.noun()}.png`,
        file_url: faker.helpers.arrayElement(sampleImageUrls),
        file_size: faker.number.int({ min: 50000, max: 2000000 }),
        mime_type: 'image/png',
      })
    } else {
      const ext = faker.helpers.arrayElement(['pdf', 'docx', 'xlsx', 'zip'])
      attachments.push({
        id: seed * 100 + i,
        file_name: `${faker.word.noun()}.${ext}`,
        file_url: `https://example.com/files/${faker.string.uuid()}.${ext}`,
        file_size: faker.number.int({ min: 10000, max: 5000000 }),
        mime_type: `application/${ext}`,
      })
    }
  }

  return attachments
}

function generateTimelineForTask(taskId: number) {
  faker.seed(taskId * 200)
  const count = faker.number.int({ min: 30, max: 50 })
  const events = []

  for (let i = 0; i < count; i++) {
    const action = faker.helpers.arrayElement(timelineActions)
    events.push({
      id: i + 1,
      action,
      actor: faker.person.fullName(),
      detail:
        action === 'assigned'
          ? faker.person.fullName()
          : action === 'level_changed'
            ? faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'])
            : undefined,
      created_at: faker.date.recent({ days: 30 }),
    })
  }

  return events.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

function generateCommentsForTask(taskId: number) {
  faker.seed(taskId * 300)
  const count = faker.number.int({ min: 45, max: 75 })
  const comments = []

  for (let i = 0; i < count; i++) {
    const hasMentions = faker.datatype.boolean({ probability: 0.2 })
    const mentions = hasMentions
      ? [{ id: faker.string.uuid(), username: faker.internet.username() }]
      : []

    comments.push({
      id: i + 1,
      author: faker.person.fullName(),
      content: faker.lorem.paragraph({ min: 1, max: 3 }),
      parent_id: null as number | null,
      reply_to_user: null as string | null,
      mentions,
      attachments: generateAttachments(taskId * 1000 + i),
      created_at: faker.date.recent({ days: 14 }),
    })
  }

  return comments.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

export function getTaskDescription(id: number): string {
  if (descriptions.has(id)) return descriptions.get(id)!

  faker.seed(id * 100)
  const md = [
    `## Overview\n`,
    faker.lorem.paragraph(3),
    `\n\n### Requirements\n`,
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    `\n\n### Technical Notes\n`,
    faker.lorem.paragraph(2),
    `\n\n\`\`\`typescript\nconst result = await fetchData({\n  id: ${id},\n  retry: 3,\n});\nconsole.log(result);\n\`\`\`\n`,
    `\n> ${faker.lorem.sentence()}\n`,
    `\nFor more details, see [documentation](https://example.com/docs).`,
  ].join('\n')

  descriptions.set(id, md)
  return md
}

export function getTimeline(taskId: number) {
  if (!timelineCache.has(taskId)) {
    timelineCache.set(taskId, generateTimelineForTask(taskId))
  }
  return timelineCache.get(taskId)!
}

export function getComments(taskId: number) {
  if (!commentsCache.has(taskId)) {
    commentsCache.set(taskId, generateCommentsForTask(taskId))
  }
  return commentsCache.get(taskId)!
}

import type { Comment, TaskDetail, TimelineEvent } from '@/schema/tasks/detail'
import type {
  GetTaskCommentsParams,
  GetTaskCommentsResponse,
  GetTaskDetailParams,
  GetTaskDetailResponse,
  GetTaskTimelineParams,
  GetTaskTimelineResponse,
} from '@/service/tasks/dto/detail'
import { faker } from '@faker-js/faker'

faker.seed(54321)

const descriptions = new Map<number, string>()

function generateMarkdownDescription(id: number): string {
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

const timelineActions = ['created', 'assigned', 'level_changed', 'commented', 'resolved'] as const

const timelineCache = new Map<number, TimelineEvent[]>()

function generateTimeline(taskId: number): TimelineEvent[] {
  if (timelineCache.has(taskId)) return timelineCache.get(taskId)!

  faker.seed(taskId * 200)
  const count = faker.number.int({ min: 30, max: 50 })
  const events: TimelineEvent[] = []

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

  const sorted = events.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  timelineCache.set(taskId, sorted)
  return sorted
}

const commentsCache = new Map<number, Comment[]>()

function generateComments(taskId: number): Comment[] {
  if (commentsCache.has(taskId)) return commentsCache.get(taskId)!

  faker.seed(taskId * 300)
  const count = faker.number.int({ min: 45, max: 75 })
  const comments: Comment[] = []

  for (let i = 0; i < count; i++) {
    comments.push({
      id: i + 1,
      author: faker.person.fullName(),
      content: faker.lorem.paragraph({ min: 1, max: 3 }),
      created_at: faker.date.recent({ days: 14 }),
    })
  }

  const sorted = comments.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  commentsCache.set(taskId, sorted)
  return sorted
}

export async function getTaskDetail(params: GetTaskDetailParams): Promise<GetTaskDetailResponse> {
  await new Promise((r) => setTimeout(r, 200))

  const { getTasks } = await import('./api')
  const { data } = await getTasks({ page: 1, perPage: 500, sort: [] })
  const task = data.find((t) => t.id === params.id)

  if (!task) {
    throw new Error(`Task ${params.id} not found`)
  }

  const detail: TaskDetail = {
    ...task,
    description: generateMarkdownDescription(params.id),
  }

  return { data: detail }
}

export async function getTaskTimeline(
  params: GetTaskTimelineParams
): Promise<GetTaskTimelineResponse> {
  await new Promise((r) => setTimeout(r, 200))

  const all = generateTimeline(params.task_id)
  const start = (params.page - 1) * params.page_size
  const data = all.slice(start, start + params.page_size)

  return { data, total: all.length }
}

export async function getTaskComments(
  params: GetTaskCommentsParams
): Promise<GetTaskCommentsResponse> {
  await new Promise((r) => setTimeout(r, 200))

  const all = generateComments(params.task_id)
  const start = (params.page - 1) * params.page_size
  const data = all.slice(start, start + params.page_size)

  return { data, total: all.length }
}

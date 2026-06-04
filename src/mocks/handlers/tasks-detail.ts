import { delay, http } from 'msw'

import { tasks } from '../data/tasks'
import { getComments, getTaskDescription, getTimeline } from '../data/tasks-detail'
import { paginate } from '../utils/filter'
import { errorEnvelope, jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const taskDetailHandlers = [
  http.get(`${BASE}/tasks/:id`, async ({ params }) => {
    await delay(200)
    const id = Number(params.id)
    const task = tasks.find((t) => t.id === id)

    if (!task) {
      return errorEnvelope(404, 'Task not found')
    }

    return jsonEnvelope({
      data: { ...task, description: getTaskDescription(id) },
    })
  }),

  http.get(`${BASE}/tasks/:id/timeline`, async ({ params, request }) => {
    await delay(200)
    const taskId = Number(params.id)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('page_size') ?? 10)

    const all = getTimeline(taskId)
    const paged = paginate(all, page, pageSize)
    return jsonEnvelope(paged)
  }),

  http.get(`${BASE}/tasks/:id/comments`, async ({ params, request }) => {
    await delay(200)
    const taskId = Number(params.id)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('page_size') ?? 10)

    const all = getComments(taskId)
    const paged = paginate(all, page, pageSize)
    return jsonEnvelope(paged)
  }),

  http.post(`${BASE}/tasks/:id/comments`, async ({ params, request }) => {
    await delay(300)
    const taskId = Number(params.id)
    const body = (await request.json()) as {
      content: string
      parent_id?: number
      reply_to_user?: string
      mention_user_ids: string[]
      attachments: Array<{
        id: number
        file_name: string
        file_url: string
        file_size: number
        mime_type: string
      }>
    }

    const all = getComments(taskId)
    const newComment = {
      id: all.length + 1,
      author: 'Current User',
      content: body.content,
      parent_id: body.parent_id ?? null,
      reply_to_user: body.reply_to_user ?? null,
      mentions: body.mention_user_ids.map((id) => ({ id, username: id })),
      attachments: body.attachments,
      created_at: new Date(),
    }

    all.unshift(newComment)
    return jsonEnvelope({ data: newComment })
  }),
]

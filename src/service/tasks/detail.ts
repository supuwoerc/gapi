import { z } from 'zod'

import { commentSchema, taskDetailSchema, timelineEventSchema } from '@/schema/task/detail'
import type { Comment, CommentAttachment, TaskDetail, TimelineEvent } from '@/schema/task/detail'
import type { PaginatedResponse } from '@/types/shared'

import { get, post } from '@/lib/http'

export interface GetTaskTimelineParams {
  task_id: number
  page: number
  page_size: number
}

export interface GetTaskCommentsParams {
  task_id: number
  page: number
  page_size: number
}

export interface CreateCommentParams {
  task_id: number
  content: string
  parent_id?: number
  reply_to_user?: string
  mention_user_ids: string[]
  attachments: CommentAttachment[]
}

export async function getTaskDetail(params: { id: number }) {
  const res = await get<{ data: TaskDetail }>(`/tasks/${params.id}`)
  return { data: taskDetailSchema.parse(res.data) }
}

export async function getTaskTimeline(params: GetTaskTimelineParams) {
  const res = await get<PaginatedResponse<TimelineEvent>>(`/tasks/${params.task_id}/timeline`, {
    searchParams: { page: String(params.page), page_size: String(params.page_size) },
  })
  return { data: z.array(timelineEventSchema).parse(res.data), total: res.total }
}

export async function getTaskComments(params: GetTaskCommentsParams) {
  const res = await get<PaginatedResponse<Comment>>(`/tasks/${params.task_id}/comments`, {
    searchParams: { page: String(params.page), page_size: String(params.page_size) },
  })
  return { data: z.array(commentSchema).parse(res.data), total: res.total }
}

export async function createComment(params: CreateCommentParams) {
  const { task_id, ...body } = params
  const res = await post<{ data: Comment }>(`/tasks/${task_id}/comments`, { json: body })
  return { data: commentSchema.parse(res.data) }
}

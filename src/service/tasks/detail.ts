import { z } from 'zod'

import { commentSchema, taskDetailSchema, timelineEventSchema } from '@/schema/tasks/detail'

import { get, post } from '@/lib/http'

import type {
  CreateCommentParams,
  CreateCommentResponse,
  GetTaskCommentsParams,
  GetTaskCommentsResponse,
  GetTaskDetailParams,
  GetTaskDetailResponse,
  GetTaskTimelineParams,
  GetTaskTimelineResponse,
} from './dto/detail'

export async function getTaskDetail(params: GetTaskDetailParams) {
  const res = await get<GetTaskDetailResponse>(`/tasks/${params.id}`)
  return { data: taskDetailSchema.parse(res.data) }
}

export async function getTaskTimeline(params: GetTaskTimelineParams) {
  const res = await get<GetTaskTimelineResponse>(`/tasks/${params.task_id}/timeline`, {
    searchParams: { page: String(params.page), page_size: String(params.page_size) },
  })
  return { data: z.array(timelineEventSchema).parse(res.data), total: res.total }
}

export async function getTaskComments(params: GetTaskCommentsParams) {
  const res = await get<GetTaskCommentsResponse>(`/tasks/${params.task_id}/comments`, {
    searchParams: { page: String(params.page), page_size: String(params.page_size) },
  })
  return { data: z.array(commentSchema).parse(res.data), total: res.total }
}

export async function createComment(params: CreateCommentParams) {
  const { task_id, ...body } = params
  const res = await post<CreateCommentResponse>(`/tasks/${task_id}/comments`, { json: body })
  return { data: commentSchema.parse(res.data) }
}

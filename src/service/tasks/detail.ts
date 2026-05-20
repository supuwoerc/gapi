import { z } from 'zod'

import {
  createComment as _createComment,
  getTaskComments as _getTaskComments,
  getTaskDetail as _getTaskDetail,
  getTaskTimeline as _getTaskTimeline,
} from '@/mocks/tasks/detail'
import { commentSchema, taskDetailSchema, timelineEventSchema } from '@/schema/tasks/detail'

import type {
  CreateCommentParams,
  GetTaskCommentsParams,
  GetTaskDetailParams,
  GetTaskTimelineParams,
} from './dto/detail'

export async function getTaskDetail(params: GetTaskDetailParams) {
  const res = await _getTaskDetail(params)
  return { data: taskDetailSchema.parse(res.data) }
}

export async function getTaskTimeline(params: GetTaskTimelineParams) {
  const res = await _getTaskTimeline(params)
  return { data: z.array(timelineEventSchema).parse(res.data), total: res.total }
}

export async function getTaskComments(params: GetTaskCommentsParams) {
  const res = await _getTaskComments(params)
  return { data: z.array(commentSchema).parse(res.data), total: res.total }
}

export async function createComment(params: CreateCommentParams) {
  const res = await _createComment(params)
  return { data: commentSchema.parse(res.data) }
}

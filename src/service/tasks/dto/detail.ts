import type { Comment, CommentAttachment, TaskDetail, TimelineEvent } from '@/schema/tasks/detail'

export interface GetTaskDetailParams {
  id: number
}

export interface GetTaskDetailResponse {
  data: TaskDetail
}

export interface GetTaskTimelineParams {
  task_id: number
  page: number
  page_size: number
}

export interface GetTaskTimelineResponse {
  data: TimelineEvent[]
  total: number
}

export interface GetTaskCommentsParams {
  task_id: number
  page: number
  page_size: number
}

export interface GetTaskCommentsResponse {
  data: Comment[]
  total: number
}

export interface CreateCommentParams {
  task_id: number
  content: string
  parent_id?: number
  reply_to_user?: string
  mention_user_ids: string[]
  attachments: CommentAttachment[]
}

export interface CreateCommentResponse {
  data: Comment
}

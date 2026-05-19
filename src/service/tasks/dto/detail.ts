import type { Comment, TaskDetail, TimelineEvent } from '@/schema/tasks/detail'

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

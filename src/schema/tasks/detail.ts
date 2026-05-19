import { z } from 'zod'

import { taskSchema } from './tasks'

export const taskDetailSchema = taskSchema.extend({
  description: z.string(),
})
export type TaskDetail = z.infer<typeof taskDetailSchema>

export const timelineEventSchema = z.object({
  id: z.number(),
  action: z.string(),
  actor: z.string(),
  detail: z.string().optional(),
  created_at: z.coerce.date(),
})
export type TimelineEvent = z.infer<typeof timelineEventSchema>

export const commentSchema = z.object({
  id: z.number(),
  author: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
})
export type Comment = z.infer<typeof commentSchema>

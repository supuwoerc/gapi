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

export const commentAttachmentSchema = z.object({
  id: z.number(),
  file_name: z.string(),
  file_url: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
})
export type CommentAttachment = z.infer<typeof commentAttachmentSchema>

export const commentMentionSchema = z.object({
  id: z.string(),
  username: z.string(),
})
export type CommentMention = z.infer<typeof commentMentionSchema>

export const commentSchema = z.object({
  id: z.number(),
  author: z.string(),
  content: z.string(),
  parent_id: z.number().nullable(),
  reply_to_user: z.string().nullable(),
  mentions: z.array(commentMentionSchema),
  attachments: z.array(commentAttachmentSchema),
  created_at: z.coerce.date(),
})
export type Comment = z.infer<typeof commentSchema>

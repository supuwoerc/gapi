import { z } from 'zod'

import { commentAttachmentSchema, commentMentionSchema } from './task/detail'

export const selectionCommentTargetTypeSchema = z.literal('document')
export const selectionCommentFieldSchema = z.literal('content')

export const selectionCommentAnchorSchema = z.object({
  start: z.number(),
  end: z.number(),
})
export type SelectionCommentAnchor = z.infer<typeof selectionCommentAnchorSchema>

export const selectionCommentSchema = z.object({
  id: z.number(),
  target_type: selectionCommentTargetTypeSchema,
  target_id: z.coerce.number(),
  field: selectionCommentFieldSchema,
  mark_id: z.string(),
  quote: z.string(),
  anchor: selectionCommentAnchorSchema,
  author: z.string(),
  content: z.string(),
  mentions: z.array(commentMentionSchema),
  attachments: z.array(commentAttachmentSchema),
  created_at: z.coerce.date(),
})
export type SelectionComment = z.infer<typeof selectionCommentSchema>

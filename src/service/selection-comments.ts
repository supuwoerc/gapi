import { z } from 'zod'

import type { SelectionComment, SelectionCommentAnchor } from '@/schema/selection-comment'
import { selectionCommentSchema } from '@/schema/selection-comment'
import type { CommentAttachment } from '@/schema/task/detail'

import { get, post } from '@/lib/http'

export interface GetSelectionCommentsParams {
  target_type: 'document'
  target_id: number
  field: 'content'
}

export interface CreateSelectionCommentParams extends GetSelectionCommentsParams {
  mark_id: string
  quote: string
  anchor: SelectionCommentAnchor
  content: string
  mention_user_ids: string[]
  attachments: CommentAttachment[]
}

export async function getSelectionComments(params: GetSelectionCommentsParams) {
  const res = await get<{ data: SelectionComment[] }>('/selection-comments', {
    searchParams: {
      target_type: params.target_type,
      target_id: String(params.target_id),
      field: params.field,
    },
  })
  return { data: z.array(selectionCommentSchema).parse(res.data) }
}

export async function createSelectionComment(params: CreateSelectionCommentParams) {
  const res = await post<{ data: SelectionComment }>('/selection-comments', { json: params })
  return { data: selectionCommentSchema.parse(res.data) }
}

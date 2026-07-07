import type { SelectionComment } from '@/schema/selection-comment'

const comments: SelectionComment[] = []
let nextId = 1

export function getSelectionComments(params: {
  target_type: 'document'
  target_id: number
  field: 'content'
}) {
  return comments
    .filter(
      (comment) =>
        comment.target_type === params.target_type &&
        comment.target_id === params.target_id &&
        comment.field === params.field
    )
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
}

export function createSelectionComment(
  params: Omit<SelectionComment, 'id' | 'author' | 'mentions' | 'created_at'> & {
    mention_user_ids: string[]
  }
) {
  const comment: SelectionComment = {
    id: nextId++,
    target_type: params.target_type,
    target_id: params.target_id,
    field: params.field,
    mark_id: params.mark_id,
    quote: params.quote,
    anchor: params.anchor,
    author: 'Current User',
    content: params.content,
    mentions: params.mention_user_ids.map((id) => ({ id, username: id })),
    attachments: params.attachments,
    created_at: new Date(),
  }

  comments.unshift(comment)
  return comment
}

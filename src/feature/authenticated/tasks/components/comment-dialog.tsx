'use no memo'

import * as React from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createComment } from '@/service/tasks/detail'
import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CommentEditor, type CommentEditorRef } from '@/components/lexical/comment-editor'

interface ParentComment {
  id: number
  author: string
}

interface CommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: number
  parentComment?: ParentComment
}

export function CommentDialog({ open, onOpenChange, taskId, parentComment }: CommentDialogProps) {
  const { t } = useTranslation('tasks')
  const queryClient = useQueryClient()
  const editorRef = React.useRef<CommentEditorRef>(null)

  const mutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
      editorRef.current?.clear()
      onOpenChange(false)
    },
  })

  function handleSubmit() {
    if (!editorRef.current || editorRef.current.isEmpty()) return

    mutation.mutate({
      task_id: taskId,
      content: editorRef.current.getSerializedState(),
      parent_id: parentComment?.id,
      reply_to_user: parentComment?.author,
      mention_user_ids: editorRef.current.getMentionUserIds(),
      attachments: [],
    })
  }

  async function handleImageUpload(file: File): Promise<string> {
    // TODO: Replace with actual upload API when available
    return URL.createObjectURL(file)
  }

  const title = parentComment
    ? t('detail.comments.replyTo', { user: parentComment.author })
    : t('detail.comments.create')

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <CommentEditor ref={editorRef} onUpload={handleImageUpload} />

        <DialogFooter>
          <div className="flex w-full items-center justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={mutation.isPending}>
              <Send className="size-4" />
              {t('detail.comments.send')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

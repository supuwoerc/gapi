'use no memo'

import * as React from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSelectionComment } from '@/service/selection-comments'
import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CommentEditor, type CommentEditorRef } from '@/components/lexical/comment-editor'
import type { ReadOnlyEditorSelection } from '@/components/lexical/read-only-editor'

export interface PendingSelectionComment extends ReadOnlyEditorSelection {
  markId: string
}

interface SelectionCommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: number
  selection?: PendingSelectionComment
  onCreated?: (markId: string) => void
}

export function SelectionCommentDialog({
  open,
  onOpenChange,
  documentId,
  selection,
  onCreated,
}: SelectionCommentDialogProps) {
  const { t } = useTranslation('documents')
  const queryClient = useQueryClient()
  const editorRef = React.useRef<CommentEditorRef>(null)

  const mutation = useMutation({
    mutationFn: createSelectionComment,
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: [
          'selection-comments',
          { target_type: 'document', target_id: documentId, field: 'content' },
        ],
      })
      editorRef.current?.clear()
      onCreated?.(res.data.mark_id)
      onOpenChange(false)
    },
  })

  function handleSubmit() {
    if (!selection || !editorRef.current || editorRef.current.isEmpty()) return

    mutation.mutate({
      target_type: 'document',
      target_id: documentId,
      field: 'content',
      mark_id: selection.markId,
      quote: selection.quote,
      anchor: selection.anchor,
      content: editorRef.current.getSerializedState(),
      mention_user_ids: editorRef.current.getMentionUserIds(),
      attachments: [],
    })
  }

  async function handleImageUpload(file: File): Promise<string> {
    // TODO: Replace with actual upload API when available.
    return URL.createObjectURL(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('detail.selectionComments.create')}</DialogTitle>
          <DialogDescription>{t('detail.selectionComments.quote')}</DialogDescription>
        </DialogHeader>

        {selection ? (
          <blockquote className="line-clamp-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {selection.quote}
          </blockquote>
        ) : null}

        <CommentEditor ref={editorRef} onUpload={handleImageUpload} />

        <DialogFooter>
          <div className="flex w-full items-center justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={mutation.isPending || !selection}>
              <Send />
              {t('detail.selectionComments.send')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

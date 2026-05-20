'use no memo'

import * as React from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CommentAttachment } from '@/schema/tasks/detail'
import { createComment } from '@/service/tasks/detail'
import { getUsers } from '@/service/users/users'
import * as MentionPrimitive from '@diceui/mention'
import { FileIcon, Paperclip, Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MentionItem } from '@/components/ui/mention'

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
  const { t } = useTranslation('feature')
  const queryClient = useQueryClient()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [mentionValue, setMentionValue] = React.useState<string[]>([])
  const [attachments, setAttachments] = React.useState<CommentAttachment[]>([])
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const { data: usersData } = useQuery({
    queryKey: ['users-for-mention'],
    queryFn: () => getUsers({ page: 1, perPage: 50, sort: [] }),
  })

  const users = usersData?.data ?? []

  const mutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
      handleClose()
    },
  })

  function handleClose() {
    setMentionValue([])
    setAttachments([])
    onOpenChange(false)
  }

  function handleSubmit() {
    const content = textareaRef.current?.value ?? ''
    if (!content.trim() && attachments.length === 0) return

    mutation.mutate({
      task_id: taskId,
      content,
      parent_id: parentComment?.id,
      reply_to_user: parentComment?.author,
      mention_user_ids: mentionValue,
      attachments,
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      const attachment: CommentAttachment = {
        id: Date.now() + Math.random(),
        file_name: file.name,
        file_url: url,
        file_size: file.size,
        mime_type: file.type,
      }
      setAttachments((prev) => [...prev, attachment])
    }

    e.target.value = ''
  }

  function removeAttachment(id: number) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  function isImage(mimeType: string) {
    return mimeType.startsWith('image/')
  }

  const title = parentComment
    ? t('taskDetail.comments.replyTo', { user: parentComment.author })
    : t('taskDetail.comments.create')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <MentionPrimitive.Root
            value={mentionValue}
            onValueChange={setMentionValue}
            modal
            className="**:data-tag:rounded **:data-tag:bg-blue-200 **:data-tag:py-px **:data-tag:text-blue-950 dark:**:data-tag:bg-blue-800 dark:**:data-tag:text-blue-50"
          >
            <MentionPrimitive.Input
              ref={textareaRef as unknown as React.Ref<HTMLInputElement>}
              placeholder={t('taskDetail.comments.placeholder')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              asChild
            >
              <textarea />
            </MentionPrimitive.Input>
            <MentionPrimitive.Content className="relative z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
              {users
                .filter((user) => !mentionValue.includes(user.id))
                .map((user) => (
                  <MentionItem key={user.id} value={user.id} label={user.username}>
                    <span className="text-sm">{user.username}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </MentionItem>
                ))}
            </MentionPrimitive.Content>
          </MentionPrimitive.Root>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative flex items-center gap-1 rounded-md border p-1.5"
                >
                  {isImage(attachment.mime_type) ? (
                    <img
                      src={attachment.file_url}
                      alt={attachment.file_name}
                      className="size-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-1">
                      <FileIcon className="size-4 text-muted-foreground" />
                      <span className="max-w-24 truncate text-xs">{attachment.file_name}</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" size="icon-sm" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="size-4" />
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={mutation.isPending}>
              <Send className="size-4" />
              {t('taskDetail.comments.send')}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            className="hidden"
            onChange={handleFileChange}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

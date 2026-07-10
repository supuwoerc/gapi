'use no memo'

import * as React from 'react'

import { useQuery } from '@tanstack/react-query'

import { getSelectionComments } from '@/service/selection-comments'
import { MessageSquareText } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import type {
  ReadOnlyEditorMarkStatuses,
  ReadOnlyEditorSelection,
} from '@/components/lexical/read-only-editor'
import { ReadOnlyEditor } from '@/components/lexical/read-only-editor'

import { type PendingSelectionComment, SelectionCommentDialog } from './selection-comment-dialog'
import { SelectionCommentsPanel } from './selection-comments-panel'

interface DocumentSelectionCommentsProps {
  documentId: number
  content: string
}

const selectionCommentsQueryBase = {
  target_type: 'document',
  field: 'content',
} as const

export function DocumentSelectionComments({ documentId, content }: DocumentSelectionCommentsProps) {
  const { t } = useTranslation('documents')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [mobileCommentsOpen, setMobileCommentsOpen] = React.useState(false)
  const [pendingSelection, setPendingSelection] = React.useState<PendingSelectionComment>()
  const [activeMarkId, setActiveMarkId] = React.useState<string>()
  const [markStatuses, setMarkStatuses] = React.useState<ReadOnlyEditorMarkStatuses>({})
  const activeTimerRef = React.useRef<number | undefined>(undefined)

  const queryParams = React.useMemo(
    () => ({ ...selectionCommentsQueryBase, target_id: documentId }),
    [documentId]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['selection-comments', queryParams],
    queryFn: () => getSelectionComments(queryParams),
  })

  const comments = React.useMemo(() => data?.data ?? [], [data?.data])
  const commentMarks = React.useMemo(
    () =>
      comments.map((comment) => ({
        mark_id: comment.mark_id,
        quote: comment.quote,
        anchor: comment.anchor,
      })),
    [comments]
  )

  React.useEffect(() => {
    return () => {
      if (activeTimerRef.current) window.clearTimeout(activeTimerRef.current)
    }
  }, [])

  const showActiveMark = React.useCallback((markId: string) => {
    setActiveMarkId(markId)
    if (activeTimerRef.current) window.clearTimeout(activeTimerRef.current)
    activeTimerRef.current = window.setTimeout(() => setActiveMarkId(undefined), 1800)
  }, [])

  const handleCreateSelectionComment = React.useCallback((selection: ReadOnlyEditorSelection) => {
    setPendingSelection({ ...selection, markId: nanoid(10) })
    setDialogOpen(true)
  }, [])

  const handleMarkStatusesChange = React.useCallback((statuses: ReadOnlyEditorMarkStatuses) => {
    setMarkStatuses(statuses)
  }, [])

  const handleMobileCommentClick = React.useCallback(
    (markId: string) => {
      setMobileCommentsOpen(false)
      showActiveMark(markId)
    },
    [showActiveMark]
  )

  return (
    <>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="gap-4 py-5">
          <CardHeader>
            <CardTitle>{t('detail.content')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadOnlyEditor
              content={content}
              commentMarks={commentMarks}
              activeMarkId={activeMarkId}
              selectionButtonLabel={t('detail.selectionComments.add')}
              onCreateSelectionComment={handleCreateSelectionComment}
              onMarkClick={showActiveMark}
              onMarkStatusesChange={handleMarkStatusesChange}
            />
          </CardContent>
        </Card>

        <div className="hidden xl:block">
          <SelectionCommentsPanel
            comments={comments}
            loading={isLoading}
            activeMarkId={activeMarkId}
            markStatuses={markStatuses}
            onCommentClick={showActiveMark}
          />
        </div>
      </div>

      <Sheet open={mobileCommentsOpen} onOpenChange={setMobileCommentsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed right-4 bottom-4 z-40 shadow-lg xl:hidden"
            size="sm"
            aria-label={t('detail.selectionComments.title')}
          >
            <MessageSquareText />
            {t('detail.selectionComments.title')}
            <span className="rounded-full bg-primary-foreground/20 px-1.5 text-xs">
              {comments.length}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[82vh] min-h-[45vh] gap-0 overflow-hidden rounded-t-lg p-0 xl:hidden"
        >
          <SheetHeader className="pb-3 text-start">
            <SheetTitle>{t('detail.selectionComments.title')}</SheetTitle>
            <SheetDescription>
              {t('detail.selectionComments.count', { count: comments.length })}
            </SheetDescription>
          </SheetHeader>
          <SelectionCommentsPanel
            comments={comments}
            loading={isLoading}
            activeMarkId={activeMarkId}
            markStatuses={markStatuses}
            onCommentClick={handleMobileCommentClick}
            className="min-h-0 flex-1 rounded-none border-0 py-0 shadow-none xl:static xl:max-h-none"
            hideHeader
          />
        </SheetContent>
      </Sheet>

      <SelectionCommentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        documentId={documentId}
        selection={pendingSelection}
        onCreated={showActiveMark}
      />
    </>
  )
}

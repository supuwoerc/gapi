'use no memo'

import * as React from 'react'

import { useQuery } from '@tanstack/react-query'

import { getSelectionComments } from '@/service/selection-comments'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

        <SelectionCommentsPanel
          comments={comments}
          loading={isLoading}
          activeMarkId={activeMarkId}
          markStatuses={markStatuses}
          onCommentClick={showActiveMark}
        />
      </div>

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

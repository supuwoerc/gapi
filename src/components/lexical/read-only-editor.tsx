'use no memo'

import * as React from 'react'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { $createMarkNode, $isMarkNode, $wrapSelectionInMarkNode, MarkNode } from '@lexical/mark'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { registerNestedElementResolver } from '@lexical/utils'
import { $createRangeSelection, $nodesOfType, type LexicalEditor, TextNode } from 'lexical'
import { MessageSquarePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ImageNode } from './nodes/image-node'
import { MentionNode } from './nodes/mention-node'
import { CodeHighlightPlugin } from './plugins/code-highlight-plugin'
import { commentEditorTheme } from './theme'

const nodes = [
  HeadingNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  ListNode,
  ListItemNode,
  LinkNode,
  MarkNode,
  MentionNode,
  ImageNode,
]

export interface ReadOnlyEditorAnchor {
  start: number
  end: number
}

export interface ReadOnlyEditorSelection {
  quote: string
  anchor: ReadOnlyEditorAnchor
}

export interface ReadOnlyEditorCommentMark extends ReadOnlyEditorSelection {
  mark_id: string
}

export type ReadOnlyEditorMarkStatuses = Record<string, boolean>

interface ReadOnlyEditorProps {
  content: string
  format?: 'markdown' | 'lexical-json'
  commentMarks?: ReadOnlyEditorCommentMark[]
  activeMarkId?: string
  selectionButtonLabel?: string
  onCreateSelectionComment?: (selection: ReadOnlyEditorSelection) => void
  onMarkClick?: (markId: string) => void
  onMarkStatusesChange?: (statuses: ReadOnlyEditorMarkStatuses) => void
}

interface TextSegment {
  key: string
  text: string
  start: number
  end: number
  isCode: boolean
}

interface FloatingSelection extends ReadOnlyEditorSelection {
  top: number
  left: number
}

interface DomSelectionResult extends ReadOnlyEditorSelection {
  isCode: boolean
}

export function ReadOnlyEditor({
  content,
  format = 'markdown',
  commentMarks = [],
  activeMarkId,
  selectionButtonLabel,
  onCreateSelectionComment,
  onMarkClick,
  onMarkStatusesChange,
}: ReadOnlyEditorProps) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'ReadOnlyEditor',
        editable: false,
        theme: commentEditorTheme,
        nodes,
        onError: (error) => console.error(error),
        editorState:
          format === 'markdown'
            ? () => {
                $convertFromMarkdownString(content, TRANSFORMERS)
              }
            : content,
      }}
    >
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="lexical-readonly outline-none select-text" />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CodeHighlightPlugin />
        <SelectionCommentsPlugin
          comments={commentMarks}
          activeMarkId={activeMarkId}
          selectionButtonLabel={selectionButtonLabel}
          onCreateSelectionComment={onCreateSelectionComment}
          onMarkClick={onMarkClick}
          onMarkStatusesChange={onMarkStatusesChange}
        />
      </div>
    </LexicalComposer>
  )
}

function SelectionCommentsPlugin({
  comments,
  activeMarkId,
  selectionButtonLabel,
  onCreateSelectionComment,
  onMarkClick,
  onMarkStatusesChange,
}: {
  comments: ReadOnlyEditorCommentMark[]
  activeMarkId?: string
  selectionButtonLabel?: string
  onCreateSelectionComment?: (selection: ReadOnlyEditorSelection) => void
  onMarkClick?: (markId: string) => void
  onMarkStatusesChange?: (statuses: ReadOnlyEditorMarkStatuses) => void
}) {
  const [editor] = useLexicalComposerContext()
  const [floatingSelection, setFloatingSelection] = React.useState<FloatingSelection | null>(null)

  React.useEffect(() => {
    return registerNestedElementResolver(
      editor,
      MarkNode,
      (from) => $createMarkNode(from.getIDs()),
      (from, to) => {
        for (const id of from.getIDs()) {
          to.addID(id)
        }
      }
    )
  }, [editor])

  React.useEffect(() => {
    if (!comments.length) {
      onMarkStatusesChange?.({})
      requestAnimationFrame(() => syncMarkElements(editor, activeMarkId))
      return
    }

    let statuses: ReadOnlyEditorMarkStatuses = {}

    editor.update(() => {
      const segments = collectTextSegments()
      const existingMarkIds = new Set<string>()

      for (const markNode of $nodesOfType(MarkNode)) {
        for (const id of markNode.getIDs()) {
          existingMarkIds.add(id)
        }
      }

      statuses = comments.reduce<ReadOnlyEditorMarkStatuses>((next, comment) => {
        const quote = getTextFromAnchor(segments, comment.anchor)
        const isValid = quote === comment.quote
        next[comment.mark_id] = isValid

        if (!isValid || existingMarkIds.has(comment.mark_id)) {
          return next
        }

        const selection = createRangeSelectionFromAnchor(segments, comment.anchor)
        if (selection) {
          $wrapSelectionInMarkNode(selection, false, comment.mark_id)
          existingMarkIds.add(comment.mark_id)
        }

        return next
      }, {})
    })

    onMarkStatusesChange?.(statuses)
    requestAnimationFrame(() => syncMarkElements(editor, activeMarkId))
  }, [activeMarkId, comments, editor, onMarkStatusesChange])

  React.useEffect(() => {
    requestAnimationFrame(() => syncMarkElements(editor, activeMarkId))
  }, [activeMarkId, editor])

  React.useEffect(() => {
    const rootElement = editor.getRootElement()
    const handleMarkClick = onMarkClick
    if (!rootElement || !handleMarkClick) return

    const root = rootElement
    const callMarkClick: (markId: string) => void = handleMarkClick

    function handleClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const markElement = target.closest<HTMLElement>('mark[data-comment-mark-ids]')
      if (!markElement || !root.contains(markElement)) return

      const markId = markElement.dataset.commentMarkIds?.split(',').filter(Boolean)[0]
      if (markId) callMarkClick(markId)
    }

    root.addEventListener('click', handleClick)
    return () => root.removeEventListener('click', handleClick)
  }, [editor, onMarkClick])

  React.useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement || !onCreateSelectionComment) return

    const root = rootElement

    function updateSelection() {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setFloatingSelection(null)
        return
      }

      const range = selection.getRangeAt(0)
      if (!root.contains(range.commonAncestorContainer)) {
        setFloatingSelection(null)
        return
      }

      const result = getSelectionFromDomRange(editor, range)
      if (!result || result.quote.trim() === '' || result.isCode) {
        setFloatingSelection(null)
        return
      }

      const rect = getSelectionRect(range)
      if (!rect) {
        setFloatingSelection(null)
        return
      }

      setFloatingSelection({
        quote: result.quote,
        anchor: result.anchor,
        top: Math.max(8, rect.top - 42),
        left: rect.left + rect.width / 2,
      })
    }

    function scheduleSelectionUpdate() {
      window.setTimeout(updateSelection, 0)
    }

    root.addEventListener('mouseup', scheduleSelectionUpdate)
    root.addEventListener('keyup', scheduleSelectionUpdate)
    document.addEventListener('selectionchange', scheduleSelectionUpdate)

    return () => {
      root.removeEventListener('mouseup', scheduleSelectionUpdate)
      root.removeEventListener('keyup', scheduleSelectionUpdate)
      document.removeEventListener('selectionchange', scheduleSelectionUpdate)
    }
  }, [editor, onCreateSelectionComment])

  function handleCreateSelectionComment() {
    if (!floatingSelection) return

    onCreateSelectionComment?.({
      quote: floatingSelection.quote,
      anchor: floatingSelection.anchor,
    })
    setFloatingSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  if (!floatingSelection || !onCreateSelectionComment) return null

  return (
    <Button
      className="fixed"
      size="sm"
      style={{
        top: floatingSelection.top,
        left: floatingSelection.left,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(event) => event.preventDefault()}
      onClick={handleCreateSelectionComment}
    >
      <MessageSquarePlus />
      {selectionButtonLabel}
    </Button>
  )
}

function collectTextSegments() {
  let offset = 0
  const segments: TextSegment[] = []

  for (const node of $nodesOfType(TextNode)) {
    const text = node.getTextContent()
    const segment: TextSegment = {
      key: node.getKey(),
      text,
      start: offset,
      end: offset + text.length,
      isCode: isInsideCode(node),
    }

    segments.push(segment)
    offset = segment.end
  }

  return segments
}

function isInsideCode(node: TextNode) {
  if (node.getType() === 'code-highlight') return true

  let parent = node.getParent()
  while (parent) {
    if (parent.getType() === 'code') return true
    parent = parent.getParent()
  }

  return false
}

function getTextFromAnchor(segments: TextSegment[], anchor: ReadOnlyEditorAnchor) {
  return segments
    .map((segment) => {
      const start = Math.max(anchor.start, segment.start)
      const end = Math.min(anchor.end, segment.end)
      if (start >= end) return ''
      return segment.text.slice(start - segment.start, end - segment.start)
    })
    .join('')
}

function createRangeSelectionFromAnchor(segments: TextSegment[], anchor: ReadOnlyEditorAnchor) {
  const start = getPointForOffset(segments, anchor.start, 'forward')
  const end = getPointForOffset(segments, anchor.end, 'backward')
  if (!start || !end) return null

  const selection = $createRangeSelection()
  selection.anchor.set(start.key, start.offset, 'text')
  selection.focus.set(end.key, end.offset, 'text')
  return selection
}

function getPointForOffset(
  segments: TextSegment[],
  offset: number,
  affinity: 'forward' | 'backward'
) {
  if (!segments.length) return null

  if (affinity === 'backward') {
    for (const segment of segments) {
      if (offset > segment.start && offset <= segment.end) {
        return { key: segment.key, offset: offset - segment.start }
      }
    }
  } else {
    for (const segment of segments) {
      if (offset >= segment.start && offset < segment.end) {
        return { key: segment.key, offset: offset - segment.start }
      }
    }
  }

  const first = segments[0]
  const last = segments.at(-1)!

  if (offset === 0) return { key: first.key, offset: 0 }
  if (offset === last.end) return { key: last.key, offset: last.text.length }

  return null
}

function getSelectionFromDomRange(editor: LexicalEditor, range: Range): DomSelectionResult | null {
  return editor.getEditorState().read(() => {
    const segments = collectTextSegments()
    const selectedSegments: Array<{
      segment: TextSegment
      start: number
      end: number
    }> = []

    for (const segment of segments) {
      const dom = editor.getElementByKey(segment.key)
      if (!dom) continue

      const localSelection = getSelectedOffsetsWithinDom(range, dom, segment.text.length)
      if (!localSelection) continue

      selectedSegments.push({
        segment,
        start: localSelection.start,
        end: localSelection.end,
      })
    }

    const first = selectedSegments[0]
    const last = selectedSegments.at(-1)
    if (!first || !last) return null

    const anchor = {
      start: first.segment.start + first.start,
      end: last.segment.start + last.end,
    }
    return {
      quote: getTextFromAnchor(segments, anchor),
      anchor,
      isCode: selectedSegments.some(({ segment }) => segment.isCode),
    }
  })
}

function getSelectedOffsetsWithinDom(range: Range, dom: Node, textLength: number) {
  const textNodes = getTextNodes(dom)
  let cursor = 0
  let start: number | null = null
  let end: number | null = null

  for (const textNode of textNodes) {
    const length = textNode.textContent?.length ?? 0
    if (length === 0) continue

    const nodeRange = document.createRange()
    nodeRange.selectNodeContents(textNode)

    const startsAfterNodeEnd = range.compareBoundaryPoints(Range.START_TO_END, nodeRange) >= 0
    const endsBeforeNodeStart = range.compareBoundaryPoints(Range.END_TO_START, nodeRange) <= 0
    nodeRange.detach()

    if (startsAfterNodeEnd || endsBeforeNodeStart) {
      cursor += length
      continue
    }

    const localStart = range.startContainer === textNode ? range.startOffset : 0
    const localEnd = range.endContainer === textNode ? range.endOffset : length

    if (start === null) start = cursor + localStart
    end = cursor + localEnd
    cursor += length
  }

  if (start === null || end === null || start === end) return null

  return {
    start: Math.max(0, Math.min(start, textLength)),
    end: Math.max(0, Math.min(end, textLength)),
  }
}

function getTextNodes(dom: Node) {
  if (dom.nodeType === Node.TEXT_NODE) return [dom as Text]

  const textNodes: Text[] = []
  const walker = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    textNodes.push(node as Text)
    node = walker.nextNode()
  }

  return textNodes
}

function getSelectionRect(range: Range) {
  const rect = range.getBoundingClientRect()
  if (rect.width > 0 || rect.height > 0) return rect

  return Array.from(range.getClientRects()).find((clientRect) => clientRect.width > 0)
}

function syncMarkElements(editor: LexicalEditor, activeMarkId?: string) {
  editor.getEditorState().read(() => {
    for (const markNode of $nodesOfType(MarkNode)) {
      const element = editor.getElementByKey(markNode.getKey())
      if (!element || !$isMarkNode(markNode)) continue

      const ids = markNode.getIDs()
      element.dataset.commentMarkIds = ids.join(',')
      element.dataset.active = activeMarkId && ids.includes(activeMarkId) ? 'true' : 'false'

      if (activeMarkId && ids.includes(activeMarkId)) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })
}

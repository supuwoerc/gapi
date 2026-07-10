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
import {
  $createRangeSelection,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
  SELECTION_CHANGE_COMMAND,
  type TextNode,
} from 'lexical'
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
      let segments = collectTextSegments()
      const existingMarkIds = new Set<string>()

      for (const markNode of collectMarkNodes()) {
        for (const id of markNode.getIDs()) {
          existingMarkIds.add(id)
        }
      }

      const nextStatuses: ReadOnlyEditorMarkStatuses = {}

      for (const comment of comments) {
        const resolvedAnchor = resolveCommentAnchor(segments, comment)
        nextStatuses[comment.mark_id] = resolvedAnchor !== null

        if (!resolvedAnchor || existingMarkIds.has(comment.mark_id)) {
          continue
        }

        const selection = createRangeSelectionFromAnchor(segments, resolvedAnchor)
        if (!selection) {
          nextStatuses[comment.mark_id] = false
          continue
        }

        $wrapSelectionInMarkNode(selection, false, comment.mark_id)
        existingMarkIds.add(comment.mark_id)
        segments = collectTextSegments()
      }

      statuses = nextStatuses
    })

    onMarkStatusesChange?.(statuses)
    requestAnimationFrame(() => syncMarkElements(editor, activeMarkId))
  }, [activeMarkId, comments, editor, onMarkStatusesChange])

  React.useEffect(() => {
    requestAnimationFrame(() => syncMarkElements(editor, activeMarkId))
  }, [activeMarkId, editor])

  React.useEffect(() => {
    const handleMarkClick = onMarkClick
    if (!handleMarkClick) return

    const callMarkClick: (markId: string) => void = handleMarkClick
    let detachRoot: (() => void) | undefined

    const unregisterRoot = editor.registerRootListener((rootElement) => {
      detachRoot?.()
      detachRoot = undefined
      if (!rootElement) return

      const root = rootElement

      function handleClick(event: MouseEvent) {
        const target = event.target
        if (!(target instanceof HTMLElement)) return

        const markElement = target.closest<HTMLElement>('mark[data-comment-mark-ids]')
        if (!markElement || !root.contains(markElement)) return

        const markId = markElement.dataset.commentMarkIds?.split(',').filter(Boolean)[0]
        if (markId) callMarkClick(markId)
      }

      root.addEventListener('click', handleClick)
      detachRoot = () => root.removeEventListener('click', handleClick)
    })

    return () => {
      detachRoot?.()
      unregisterRoot()
    }
  }, [editor, onMarkClick])

  React.useEffect(() => {
    if (!onCreateSelectionComment) return

    let detachRoot: (() => void) | undefined

    function applySelectionResult(result: DomSelectionResult | null) {
      const selection = window.getSelection()
      const root = editor.getRootElement()

      if (!result || result.quote.trim() === '' || result.isCode) {
        setFloatingSelection(null)
        return
      }

      if (!selection || !root || selection.rangeCount === 0 || selection.isCollapsed) {
        setFloatingSelection(null)
        return
      }

      const range = selection.getRangeAt(0)
      if (!root.contains(range.commonAncestorContainer)) {
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

    function readCurrentSelection() {
      let result: DomSelectionResult | null = null
      editor.getEditorState().read(() => {
        result = getSelectionFromLexicalSelection()
      })
      applySelectionResult(result)
    }

    const unregisterSelectionCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const result = getSelectionFromLexicalSelection()
        window.setTimeout(() => applySelectionResult(result), 0)
        return false
      },
      COMMAND_PRIORITY_LOW
    )

    const unregisterRoot = editor.registerRootListener((rootElement) => {
      detachRoot?.()
      detachRoot = undefined
      if (!rootElement) return

      function scheduleSelectionUpdate() {
        window.setTimeout(readCurrentSelection, 0)
      }

      rootElement.addEventListener('mouseup', scheduleSelectionUpdate)
      rootElement.addEventListener('keyup', scheduleSelectionUpdate)
      document.addEventListener('selectionchange', scheduleSelectionUpdate)

      detachRoot = () => {
        rootElement.removeEventListener('mouseup', scheduleSelectionUpdate)
        rootElement.removeEventListener('keyup', scheduleSelectionUpdate)
        document.removeEventListener('selectionchange', scheduleSelectionUpdate)
      }
    })

    return () => {
      detachRoot?.()
      unregisterRoot()
      unregisterSelectionCommand()
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

  for (const node of $getRoot().getAllTextNodes()) {
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

function collectMarkNodes() {
  const markNodes: MarkNode[] = []

  function visit(node: LexicalNode) {
    if ($isMarkNode(node)) {
      markNodes.push(node)
    }

    if (!$isElementNode(node)) return

    for (const child of node.getChildren()) {
      visit(child)
    }
  }

  visit($getRoot())
  return markNodes
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

function isSameQuote(current: string, saved: string) {
  if (current === saved) return true
  return normalizeQuote(current) === normalizeQuote(saved)
}

function normalizeQuote(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function resolveCommentAnchor(
  segments: TextSegment[],
  comment: ReadOnlyEditorCommentMark
): ReadOnlyEditorAnchor | null {
  const savedAnchorText = getTextFromAnchor(segments, comment.anchor)
  if (isSameQuote(savedAnchorText, comment.quote)) return comment.anchor

  return findAnchorByQuote(segments, comment.quote, comment.anchor.start)
}

function findAnchorByQuote(segments: TextSegment[], quote: string, preferredStart: number) {
  const text = segments.map((segment) => segment.text).join('')
  const exactIndex = text.indexOf(quote)
  if (exactIndex !== -1) return { start: exactIndex, end: exactIndex + quote.length }

  const normalizedQuote = normalizeQuote(quote)
  if (!normalizedQuote) return null

  const normalizedText = buildNormalizedTextIndex(text)
  let bestIndex = -1
  let bestDistance = Number.POSITIVE_INFINITY
  let index = normalizedText.text.indexOf(normalizedQuote)

  while (index !== -1) {
    const mappedStart = normalizedText.map[index]
    const distance = Math.abs(mappedStart - preferredStart)

    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = index
    }

    index = normalizedText.text.indexOf(normalizedQuote, index + 1)
  }

  if (bestIndex === -1) return null

  const start = normalizedText.map[bestIndex]
  const end = normalizedText.map[bestIndex + normalizedQuote.length - 1] + 1
  return { start, end }
}

function buildNormalizedTextIndex(text: string) {
  const chars: string[] = []
  const map: number[] = []
  let pendingWhitespace = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]

    if (/\s/.test(char)) {
      if (chars.length > 0) pendingWhitespace = true
      continue
    }

    if (pendingWhitespace) {
      chars.push(' ')
      map.push(index)
      pendingWhitespace = false
    }

    chars.push(char)
    map.push(index)
  }

  return { text: chars.join(''), map }
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

function getSelectionFromLexicalSelection(): DomSelectionResult | null {
  const selection = $getSelection()
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return null

  const segments = collectTextSegments()
  const anchor = getAnchorFromRangeSelection(segments, selection)
  if (!anchor) return null

  const quote = getTextFromAnchor(segments, anchor)
  return {
    quote,
    anchor,
    isCode: segments.some(
      (segment) => segment.isCode && segment.start < anchor.end && segment.end > anchor.start
    ),
  }
}

function getAnchorFromRangeSelection(segments: TextSegment[], selection: RangeSelection) {
  const isBackward = selection.isBackward()
  const startPoint = isBackward ? selection.focus : selection.anchor
  const endPoint = isBackward ? selection.anchor : selection.focus

  if (startPoint.type !== 'text' || endPoint.type !== 'text') return null

  const start = getGlobalOffsetForTextPoint(segments, startPoint.key, startPoint.offset)
  const end = getGlobalOffsetForTextPoint(segments, endPoint.key, endPoint.offset)

  if (start === null || end === null || start >= end) return null
  return { start, end }
}

function getGlobalOffsetForTextPoint(segments: TextSegment[], key: string, offset: number) {
  const segment = segments.find((item) => item.key === key)
  if (!segment) return null

  return segment.start + Math.max(0, Math.min(offset, segment.text.length))
}

function getSelectionRect(range: Range) {
  const rect = range.getBoundingClientRect()
  if (rect.width > 0 || rect.height > 0) return rect

  return Array.from(range.getClientRects()).find((clientRect) => clientRect.width > 0)
}

function syncMarkElements(editor: LexicalEditor, activeMarkId?: string) {
  editor.getEditorState().read(() => {
    for (const markNode of collectMarkNodes()) {
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

'use no memo'

import * as React from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { $getRoot, CLEAR_EDITOR_COMMAND } from 'lexical'

import { commentEditorNodes } from './nodes'
import { $isMentionNode } from './nodes/mention-node'
import { CodeHighlightPlugin } from './plugins/code-highlight-plugin'
import { ImagesPlugin } from './plugins/images-plugin'
import { MentionsPlugin } from './plugins/mentions-plugin'
import { ToolbarPlugin } from './plugins/toolbar-plugin'
import { commentEditorTheme } from './theme'

export interface CommentEditorRef {
  getSerializedState: () => string
  getMentionUserIds: () => string[]
  isEmpty: () => boolean
  clear: () => void
}

interface CommentEditorProps {
  onUpload: (file: File) => Promise<string>
}

function EditorRefPlugin({ editorRef }: { editorRef: React.RefObject<CommentEditorRef | null> }) {
  const [editor] = useLexicalComposerContext()

  React.useImperativeHandle(editorRef, () => ({
    getSerializedState() {
      return JSON.stringify(editor.getEditorState().toJSON())
    },
    getMentionUserIds() {
      const ids: string[] = []
      editor.getEditorState().read(() => {
        for (const node of $getRoot().getAllTextNodes()) {
          if ($isMentionNode(node)) {
            ids.push(node.__userId)
          }
        }
      })
      return [...new Set(ids)]
    },
    isEmpty() {
      let empty = true
      editor.getEditorState().read(() => {
        const root = $getRoot()
        const text = root.getTextContent().trim()
        empty = text === '' && root.getChildrenSize() <= 1
      })
      return empty
    },
    clear() {
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
    },
  }))

  return null
}

export const CommentEditor = React.forwardRef<CommentEditorRef, CommentEditorProps>(
  function CommentEditor({ onUpload }, ref) {
    const editorRef = React.useRef<CommentEditorRef>(null)

    React.useImperativeHandle(ref, () => editorRef.current!, [])

    return (
      <LexicalComposer
        initialConfig={{
          namespace: 'CommentEditor',
          theme: commentEditorTheme,
          nodes: commentEditorNodes,
          onError: (error) => console.error(error),
        }}
      >
        <div className="rounded-md border">
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[120px] px-3 py-2 text-sm outline-none" />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <CodeHighlightPlugin />
        <MentionsPlugin />
        <ImagesPlugin onUpload={onUpload} />
        <EditorRefPlugin editorRef={editorRef} />
      </LexicalComposer>
    )
  }
)

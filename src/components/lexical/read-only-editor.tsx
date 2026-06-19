'use no memo'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'

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
  MentionNode,
  ImageNode,
]

interface ReadOnlyEditorProps {
  content: string
  format?: 'markdown' | 'lexical-json'
}

export function ReadOnlyEditor({ content, format = 'markdown' }: ReadOnlyEditorProps) {
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
      <RichTextPlugin
        contentEditable={<ContentEditable className="lexical-readonly outline-none" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <CodeHighlightPlugin />
    </LexicalComposer>
  )
}

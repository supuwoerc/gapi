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

const nodes = [
  HeadingNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  ListNode,
  ListItemNode,
  LinkNode,
]

interface ReadOnlyEditorProps {
  content: string
}

export function ReadOnlyEditor({ content }: ReadOnlyEditorProps) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'ReadOnlyEditor',
        editable: false,
        nodes,
        onError: (error) => console.error(error),
        editorState: () => {
          $convertFromMarkdownString(content, TRANSFORMERS)
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable className="lexical-readonly outline-none" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </LexicalComposer>
  )
}

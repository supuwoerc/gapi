'use no memo'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import type { Klass, LexicalNode } from 'lexical'

import { ImageNode } from './nodes/image-node'
import { MentionNode } from './nodes/mention-node'

export const commentEditorNodes: Klass<LexicalNode>[] = [
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

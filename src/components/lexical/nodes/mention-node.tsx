'use no memo'

import type { EditorConfig, NodeKey, SerializedTextNode, Spread } from 'lexical'
import { $applyNodeReplacement, TextNode } from 'lexical'

export type SerializedMentionNode = Spread<{ userId: string; username: string }, SerializedTextNode>

export class MentionNode extends TextNode {
  __userId: string
  __username: string

  static getType(): string {
    return 'mention'
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__userId, node.__username, node.__text, node.__key)
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.userId, serializedNode.username)
    node.setTextContent(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  constructor(userId: string, username: string, text?: string, key?: NodeKey) {
    super(text ?? `@${username}`, key)
    this.__userId = userId
    this.__username = username
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      type: 'mention',
      userId: this.__userId,
      username: this.__username,
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    dom.className =
      'rounded bg-blue-100 px-1 py-0.5 text-blue-900 dark:bg-blue-800 dark:text-blue-100'
    return dom
  }

  updateDOM(): boolean {
    return false
  }

  isTextEntity(): true {
    return true
  }

  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }
}

export function $createMentionNode(userId: string, username: string): MentionNode {
  const node = new MentionNode(userId, username)
  node.setMode('token')
  return $applyNodeReplacement(node)
}

export function $isMentionNode(node: unknown): node is MentionNode {
  return node instanceof MentionNode
}

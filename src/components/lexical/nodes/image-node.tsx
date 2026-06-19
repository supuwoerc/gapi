'use no memo'

import type { JSX } from 'react'

import type { EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import { $applyNodeReplacement, DecoratorNode, createCommand } from 'lexical'

export type SerializedImageNode = Spread<
  { src: string; altText: string; width?: number; height?: number },
  SerializedLexicalNode
>

export const INSERT_IMAGE_COMMAND = createCommand<{ src: string; altText: string }>(
  'INSERT_IMAGE_COMMAND'
)

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: number | undefined
  __height: number | undefined

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__key)
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
    })
  }

  constructor(src: string, altText: string, width?: number, height?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    if (theme.image) {
      span.className = theme.image as string
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  isInline(): true {
    return true
  }

  decorate(): JSX.Element {
    return (
      <img
        src={this.__src}
        alt={this.__altText}
        width={this.__width}
        height={this.__height}
        className="inline-block max-w-full rounded"
        draggable={false}
      />
    )
  }
}

export function $createImageNode(options: {
  src: string
  altText: string
  width?: number
  height?: number
}): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(options.src, options.altText, options.width, options.height)
  )
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

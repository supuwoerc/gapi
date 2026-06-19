'use no memo'

import * as React from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR } from 'lexical'

import { $createImageNode, INSERT_IMAGE_COMMAND } from '../nodes/image-node'

interface ImagesPluginProps {
  onUpload: (file: File) => Promise<string>
}

export function ImagesPlugin({ onUpload }: ImagesPluginProps) {
  const [editor] = useLexicalComposerContext()
  const onUploadRef = React.useRef(onUpload)

  React.useEffect(() => {
    onUploadRef.current = onUpload
  })

  React.useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode({ src: payload.src, altText: payload.altText })
        $insertNodes([imageNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  React.useEffect(() => {
    function uploadImage(file: File) {
      const blobUrl = URL.createObjectURL(file)

      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: blobUrl, altText: file.name })

      onUploadRef
        .current(file)
        .then((permanentUrl) => {
          editor.update(() => {
            const nodeMap = editor.getEditorState()._nodeMap
            for (const [, node] of nodeMap) {
              if (
                node.__type === 'image' &&
                (node as unknown as { __src: string }).__src === blobUrl
              ) {
                const writable = node.getWritable() as unknown as { __src: string }
                writable.__src = permanentUrl
                break
              }
            }
          })
        })
        .catch(() => {
          editor.update(() => {
            const nodeMap = editor.getEditorState()._nodeMap
            for (const [, node] of nodeMap) {
              if (
                node.__type === 'image' &&
                (node as unknown as { __src: string }).__src === blobUrl
              ) {
                node.remove()
                break
              }
            }
          })
        })
        .finally(() => {
          URL.revokeObjectURL(blobUrl)
        })
    }

    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) uploadImage(file)
          break
        }
      }
    }

    function handleDrop(event: DragEvent) {
      const files = event.dataTransfer?.files
      if (!files) return

      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          event.preventDefault()
          uploadImage(file)
          break
        }
      }
    }

    const rootElement = editor.getRootElement()
    if (rootElement) {
      rootElement.addEventListener('paste', handlePaste)
      rootElement.addEventListener('drop', handleDrop)
      return () => {
        rootElement.removeEventListener('paste', handlePaste)
        rootElement.removeEventListener('drop', handleDrop)
      }
    }
  }, [editor])

  return null
}

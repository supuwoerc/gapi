'use no memo'

import * as React from 'react'

import { $createCodeNode, $isCodeNode } from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createQuoteNode, $isHeadingNode } from '@lexical/rich-text'
import { $getNearestNodeOfType } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import {
  Bold,
  Code,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'

import { INSERT_IMAGE_COMMAND } from '../nodes/image-node'

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set())
  const [blockType, setBlockType] = React.useState<string>('paragraph')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const formats = new Set<string>()
    if (selection.hasFormat('bold')) formats.add('bold')
    if (selection.hasFormat('italic')) formats.add('italic')
    if (selection.hasFormat('underline')) formats.add('underline')
    if (selection.hasFormat('strikethrough')) formats.add('strikethrough')
    setActiveFormats(formats)

    const anchorNode = selection.anchor.getNode()
    const element =
      anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()

    const elementKey = element.getKey()
    const elementDOM = editor.getElementByKey(elementKey)

    if (elementDOM !== null) {
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, element.constructor as never)
        setBlockType(
          parentList
            ? (parentList as unknown as { getListType: () => string }).getListType()
            : element.getListType()
        )
      } else if ($isHeadingNode(element)) {
        setBlockType(element.getTag())
      } else if ($isCodeNode(element)) {
        setBlockType('code')
      } else {
        setBlockType(element.getType())
      }
    }
  }, [editor])

  React.useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateToolbar])

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  function formatQuote() {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()
      if (!$isElementNode(element)) return

      if (element.getType() === 'quote') {
        const paragraph = $createParagraphNode()
        paragraph.append(...element.getChildren())
        element.replace(paragraph)
      } else {
        const quote = $createQuoteNode()
        quote.append(...element.getChildren())
        element.replace(quote)
      }
    })
  }

  function formatCode() {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow()
      if (!$isElementNode(element)) return

      if ($isCodeNode(element)) {
        const paragraph = $createParagraphNode()
        paragraph.append(...element.getChildren())
        element.replace(paragraph)
      } else {
        const code = $createCodeNode()
        code.append(...element.getChildren())
        element.replace(code)
      }
    })
  }

  function insertLink() {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const node = selection.anchor.getNode()
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
      } else {
        const url = prompt('Enter URL:')
        if (url) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
        }
      }
    })
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const blobUrl = URL.createObjectURL(file)
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: blobUrl, altText: file.name })
    }
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-1 border-b px-2 py-1">
      <Toggle
        size="sm"
        pressed={activeFormats.has('bold')}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <Bold className="size-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={activeFormats.has('italic')}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <Italic className="size-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={activeFormats.has('underline')}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <Underline className="size-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={activeFormats.has('strikethrough')}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
      >
        <Strikethrough className="size-3.5" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <Toggle
        size="sm"
        pressed={blockType === 'bullet'}
        onPressedChange={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <List className="size-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={blockType === 'number'}
        onPressedChange={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <ListOrdered className="size-3.5" />
      </Toggle>
      <Toggle size="sm" pressed={blockType === 'quote'} onPressedChange={formatQuote}>
        <Quote className="size-3.5" />
      </Toggle>
      <Toggle size="sm" pressed={blockType === 'code'} onPressedChange={formatCode}>
        <Code className="size-3.5" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <Button variant="ghost" size="icon" className="size-7" onClick={insertLink}>
        <Link className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image className="size-3.5" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
    </div>
  )
}

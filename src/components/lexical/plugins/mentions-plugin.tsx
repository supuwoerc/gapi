'use no memo'

import * as React from 'react'

import { useQuery } from '@tanstack/react-query'

import type { User } from '@/schema/user/user'
import { getUsers } from '@/service/admin/users'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import type { TextNode } from 'lexical'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

import { $createMentionNode } from '../nodes/mention-node'

class MentionOption extends MenuOption {
  userId: string
  username: string
  email: string
  avatar: string

  constructor(user: User) {
    super(String(user.id))
    this.userId = String(user.id)
    this.username = user.username
    this.email = user.email
    this.avatar = user.avatar
  }
}

export function MentionsPlugin() {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = React.useState<string | null>(null)

  const { data: usersData } = useQuery({
    queryKey: ['users-for-mention', queryString],
    queryFn: () => getUsers({ page: 1, perPage: 20, sort: [], username: queryString || undefined }),
    enabled: queryString !== null,
  })

  const options = React.useMemo(
    () => (usersData?.data ?? []).map((u) => new MentionOption(u)),
    [usersData]
  )

  const triggerFn = useBasicTypeaheadTriggerMatch('@', { minLength: 0, maxLength: 20 })

  function onSelectOption(
    option: MentionOption,
    textNodeContainingQuery: TextNode | null,
    closeMenu: () => void
  ) {
    editor.update(() => {
      const mentionNode = $createMentionNode(option.userId, option.username)
      if (textNodeContainingQuery) {
        textNodeContainingQuery.replace(mentionNode)
      }
      mentionNode.selectNext(0, 0)
      closeMenu()
    })
  }

  return (
    <LexicalTypeaheadMenuPlugin
      triggerFn={triggerFn}
      options={options}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      anchorClassName="z-[99999]"
      parent={document.body}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, options: menuOptions }
      ) =>
        anchorElementRef.current && menuOptions.length > 0
          ? createPortal(
              <div className="max-h-60 w-64 overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {menuOptions.map((option, i) => {
                  const mentionOption = option as MentionOption
                  return (
                    <div
                      key={option.key}
                      ref={(el) => option.setRefElement(el)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
                        i === selectedIndex && 'bg-accent text-accent-foreground'
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        selectOptionAndCleanUp(option)
                      }}
                    >
                      {mentionOption.avatar ? (
                        <img
                          src={mentionOption.avatar}
                          alt={mentionOption.username}
                          className="size-6 rounded-full"
                        />
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs">
                          {mentionOption.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{mentionOption.username}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {mentionOption.email}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  )
}

import { z } from 'zod'

import { type IconName, iconNames } from 'lucide-react/dynamic'
import type { LinkProps } from 'react-router'

const baseMenuSchema = z.object({
  title: z.string(),
  badge: z.string().optional(),
  icon: z
    .custom<IconName>((val) => {
      return iconNames.includes(val as IconName)
    })
    .optional(),
})

const linkMenuSchema = baseMenuSchema
  .extend({
    url: z.union([z.string(), z.custom<LinkProps['to']>()]),
    items: z.never().optional(),
  })
  .strict()

export type LinkMenu = z.infer<typeof linkMenuSchema>

const collapsibleMenuSchema = baseMenuSchema
  .extend({
    items: z.array(
      baseMenuSchema.extend({
        url: z.union([z.string(), z.custom<LinkProps['to']>()]),
      })
    ),
    url: z.never().optional(),
  })
  .strict()

export type CollapsibleMenu = z.infer<typeof collapsibleMenuSchema>

const menuItemSchema = z.union([linkMenuSchema, collapsibleMenuSchema])

export const menuSchema = z.object({
  title: z.string(),
  items: z.array(menuItemSchema),
})

export type Menu = z.infer<typeof menuSchema>

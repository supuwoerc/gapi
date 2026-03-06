import { z } from 'zod'

import type { IconName } from 'lucide-react/dynamic'
import { iconNames } from 'lucide-react/dynamic'

export const roleSchema = z.object({
  name: z.string(),
  desc: z.string(),
  logo: z.custom<IconName>((val) => {
    return iconNames.includes(val as IconName)
  }),
})

export type Role = z.infer<typeof roleSchema>

import { z } from 'zod'

export const loginUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
})

export type LoginUser = z.infer<typeof loginUserSchema>

import { z } from 'zod'

export const roleSchema = z.object({
  id: z.coerce.number(),
  code: z.string(),
  name: z.string(),
})
export type Role = z.infer<typeof roleSchema>

export const userSchema = z.object({
  id: z.coerce.number(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  avatar: z.string(),
  bio: z.string(),
  enabled: z.boolean(),
  last_login_at: z.coerce.date().nullable(),
  login_fail_count: z.number(),
  locked_until: z.coerce.date().nullable(),
  roles: z.array(roleSchema),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

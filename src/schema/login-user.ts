import { z } from 'zod'

export const loginUserSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
  }),
  token: z.string(),
  refreshToken: z.string(),
  role: z.array(z.string()),
  menuPermissions: z.array(z.string()),
  routePermissions: z.array(z.string()),
})

export type LoginUser = z.infer<typeof loginUserSchema>

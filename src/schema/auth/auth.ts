import { z } from 'zod'

export const loginUserSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
    bio: z.string(),
  }),
  token: z.string(),
  refresh_token: z.string(),
  role: z.array(z.string()),
  menu_permissions: z.array(z.string()),
  route_permissions: z.array(z.string()),
  completed_tours: z.array(z.string()),
})

export type LoginUser = z.infer<typeof loginUserSchema>

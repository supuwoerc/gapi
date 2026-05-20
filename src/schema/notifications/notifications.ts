import { z } from 'zod'

export const notificationTypeSchema = z.union([
  z.literal('system'),
  z.literal('task'),
  z.literal('message'),
  z.literal('alert'),
])
export type NotificationType = z.infer<typeof notificationTypeSchema>

export const notificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  type: notificationTypeSchema,
  sender: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date(),
})
export type Notification = z.infer<typeof notificationSchema>

export const notificationListSchema = z.array(notificationSchema)

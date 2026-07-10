import { z } from 'zod'

export const taskLevelSchema = z.union([
  z.literal('low'),
  z.literal('medium'),
  z.literal('high'),
  z.literal('critical'),
])
export type TaskLevel = z.infer<typeof taskLevelSchema>

export const taskTypeSchema = z.union([
  z.literal('bug'),
  z.literal('feature'),
  z.literal('improvement'),
  z.literal('task'),
])
export type TaskType = z.infer<typeof taskTypeSchema>

export const taskUserSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
})
export type TaskUser = z.infer<typeof taskUserSchema>

export const taskSchema = z.object({
  id: z.number(),
  level: taskLevelSchema,
  type: taskTypeSchema,
  title: z.string(),
  creator: taskUserSchema,
  assignee: taskUserSchema,
  resolver: taskUserSchema.nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable(),
})
export type Task = z.infer<typeof taskSchema>

export const taskListSchema = z.array(taskSchema)

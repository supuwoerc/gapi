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

export const taskSchema = z.object({
  id: z.number(),
  level: taskLevelSchema,
  type: taskTypeSchema,
  title: z.string(),
  creator: z.string(),
  assignee: z.string(),
  resolver: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable(),
})
export type Task = z.infer<typeof taskSchema>

export const taskListSchema = z.array(taskSchema)

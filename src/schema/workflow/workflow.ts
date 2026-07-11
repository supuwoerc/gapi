import { z } from 'zod'

const timestampSchema = z.coerce.date()

export const workflowSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  used_count: z.number(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const workflowListSchema = z.array(workflowSchema)

export type Workflow = z.infer<typeof workflowSchema>

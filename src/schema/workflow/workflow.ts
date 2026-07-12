import { z } from 'zod'

const timestampSchema = z.coerce.date()

export const workflowUserSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
})

export const workflowNodeKindSchema = z.enum(['start', 'review', 'approval', 'automation', 'end'])
export const workflowNodeStatusSchema = z.enum(['done', 'active', 'pending'])

export const workflowFlowNodeSchema = z.object({
  id: z.string(),
  type: z.literal('workflow'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    title: z.string(),
    description: z.string(),
    kind: workflowNodeKindSchema,
    status: workflowNodeStatusSchema,
  }),
})

export const workflowFlowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
})

export const workflowFlowSchema = z.object({
  nodes: z.array(workflowFlowNodeSchema),
  edges: z.array(workflowFlowEdgeSchema),
})

export const workflowSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  used_count: z.number(),
  creator: workflowUserSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const workflowListSchema = z.array(workflowSchema)
export const workflowDetailSchema = workflowSchema.extend({
  flow: workflowFlowSchema,
})

export type WorkflowUser = z.infer<typeof workflowUserSchema>
export type WorkflowNodeKind = z.infer<typeof workflowNodeKindSchema>
export type WorkflowNodeStatus = z.infer<typeof workflowNodeStatusSchema>
export type WorkflowFlowNode = z.infer<typeof workflowFlowNodeSchema>
export type WorkflowFlowEdge = z.infer<typeof workflowFlowEdgeSchema>
export type WorkflowFlow = z.infer<typeof workflowFlowSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type WorkflowDetail = z.infer<typeof workflowDetailSchema>

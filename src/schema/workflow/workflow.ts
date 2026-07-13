import { z } from 'zod'

import { i18n } from '@/lib/i18n'

const timestampSchema = z.coerce.date()

export const workflowTypeSchema = z.enum(['project', 'employee'])

export const workflowUserSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
})

export const workflowNodeKindSchema = z.enum([
  'start',
  'review',
  'approval',
  'automation',
  'ai_employee',
  'end',
])
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
    ai_employee_id: z.coerce.number().nullable().optional(),
    employee_workflow_id: z.coerce.number().nullable().optional(),
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
  type: workflowTypeSchema.default('project'),
  used_count: z.number(),
  creator: workflowUserSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const workflowListSchema = z.array(workflowSchema)
export const workflowDetailSchema = workflowSchema.extend({
  flow: workflowFlowSchema,
})
export const workflowBasicInfoSchema = z.object({
  type: workflowTypeSchema,
  name: z
    .string()
    .trim()
    .min(1, {
      error: () => i18n.t('workflows:createPage.validation.nameRequired'),
    }),
  description: z
    .string()
    .trim()
    .min(1, {
      error: () => i18n.t('workflows:createPage.validation.descriptionRequired'),
    }),
})
export const workflowMutationSchema = workflowBasicInfoSchema
  .extend({
    flow: workflowFlowSchema.superRefine((flow, ctx) => {
      const startCount = flow.nodes.filter((node) => node.data.kind === 'start').length
      const endCount = flow.nodes.filter((node) => node.data.kind === 'end').length

      if (startCount === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['nodes'],
          message: i18n.t('workflows:createPage.validation.startRequired'),
        })
      }

      if (startCount > 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['nodes'],
          message: i18n.t('workflows:createPage.validation.singleStartRequired'),
        })
      }

      if (endCount === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['nodes'],
          message: i18n.t('workflows:createPage.validation.endRequired'),
        })
      }
    }),
  })
  .superRefine((workflow, ctx) => {
    if (
      workflow.type === 'employee' &&
      workflow.flow.nodes.some((node) => node.data.kind === 'ai_employee')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['flow', 'nodes'],
        message: i18n.t('workflows:createPage.validation.employeeNodeNotAllowed'),
      })
    }
  })

export type WorkflowUser = z.infer<typeof workflowUserSchema>
export type WorkflowType = z.infer<typeof workflowTypeSchema>
export type WorkflowNodeKind = z.infer<typeof workflowNodeKindSchema>
export type WorkflowNodeStatus = z.infer<typeof workflowNodeStatusSchema>
export type WorkflowFlowNode = z.infer<typeof workflowFlowNodeSchema>
export type WorkflowFlowEdge = z.infer<typeof workflowFlowEdgeSchema>
export type WorkflowFlow = z.infer<typeof workflowFlowSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type WorkflowDetail = z.infer<typeof workflowDetailSchema>
export type WorkflowBasicInfo = z.infer<typeof workflowBasicInfoSchema>
export type WorkflowMutation = z.infer<typeof workflowMutationSchema>

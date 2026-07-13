import { z } from 'zod'

import { i18n } from '@/lib/i18n'

const timestampSchema = z.coerce.date()

export const aiEmployeeStatusSchema = z.enum(['active', 'disabled'])
export const aiEmployeeCodeProviderSchema = z.enum(['github', 'gitlab'])

export const aiEmployeeSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  avatar: z.string(),
  status: aiEmployeeStatusSchema,
  code_provider: aiEmployeeCodeProviderSchema,
  default_model: z.string(),
  system_prompt: z.string(),
  workflow_count: z.number(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const aiEmployeeMutationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      error: () => i18n.t('aiEmployees:editDialog.validation.nameRequired'),
    }),
  description: z.string().trim(),
  avatar: z.string(),
  status: aiEmployeeStatusSchema,
  code_provider: aiEmployeeCodeProviderSchema,
  default_model: z
    .string()
    .trim()
    .min(1, {
      error: () => i18n.t('aiEmployees:editDialog.validation.defaultModelRequired'),
    }),
  system_prompt: z.string().trim(),
})

export const aiEmployeeWorkflowIdsMutationSchema = z.object({
  workflow_ids: z.array(z.coerce.number().int()).transform((ids) => Array.from(new Set(ids))),
})

export const aiEmployeeListSchema = z.array(aiEmployeeSchema)

export type AiEmployeeStatus = z.infer<typeof aiEmployeeStatusSchema>
export type AiEmployeeCodeProvider = z.infer<typeof aiEmployeeCodeProviderSchema>
export type AiEmployee = z.infer<typeof aiEmployeeSchema>
export type AiEmployeeMutation = z.infer<typeof aiEmployeeMutationSchema>
export type AiEmployeeWorkflowIdsMutation = z.infer<typeof aiEmployeeWorkflowIdsMutationSchema>

import {
  workflowDetailSchema,
  workflowListSchema,
  workflowMutationSchema,
} from '@/schema/workflow/workflow'
import type { WorkflowDetail, WorkflowMutation } from '@/schema/workflow/workflow'
import type { PaginatedResponse } from '@/types/shared'

import { get, patch, post } from '@/lib/http'

export interface GetWorkflowsParams {
  page: number
  perPage: number
  keyword?: string
}

export async function getWorkflows(params: GetWorkflowsParams) {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.keyword) searchParams.keyword = params.keyword

  const res = await get<PaginatedResponse<unknown>>('/workflows', { searchParams })
  return { data: workflowListSchema.parse(res.data), total: res.total }
}

export async function getWorkflowDetail(params: { id: number }) {
  const res = await get<{ data: WorkflowDetail }>(`/workflows/${params.id}`)
  return { data: workflowDetailSchema.parse(res.data) }
}

export async function createWorkflow(data: WorkflowMutation) {
  const payload = workflowMutationSchema.parse(data)
  const res = await post<unknown>('/workflows', { json: payload })
  return workflowDetailSchema.parse(res)
}

export async function updateWorkflow(id: number, data: WorkflowMutation) {
  const payload = workflowMutationSchema.parse(data)
  const res = await patch<unknown>(`/workflows/${id}`, { json: payload })
  return workflowDetailSchema.parse(res)
}

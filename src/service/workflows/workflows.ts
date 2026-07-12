import { workflowDetailSchema, workflowListSchema } from '@/schema/workflow/workflow'
import type { WorkflowDetail } from '@/schema/workflow/workflow'
import type { PaginatedResponse } from '@/types/shared'

import { get } from '@/lib/http'

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

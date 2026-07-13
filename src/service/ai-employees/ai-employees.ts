import {
  aiEmployeeListSchema,
  aiEmployeeMutationSchema,
  aiEmployeeSchema,
  aiEmployeeWorkflowIdsMutationSchema,
} from '@/schema/ai-employee/ai-employee'
import type {
  AiEmployeeMutation,
  AiEmployeeStatus,
  AiEmployeeWorkflowIdsMutation,
} from '@/schema/ai-employee/ai-employee'
import { workflowListSchema } from '@/schema/workflow/workflow'
import type { PaginatedResponse } from '@/types/shared'

import { del, get, patch, post } from '@/lib/http'

export interface GetAiEmployeesParams {
  page: number
  perPage: number
  sort?: { id: string; desc: boolean }[]
  keyword?: string
  status?: AiEmployeeStatus[]
  codeProvider?: string[]
  filters?: string
}

export async function getAiEmployees(params: GetAiEmployeesParams) {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.keyword) searchParams.keyword = params.keyword
  if (params.sort && params.sort.length > 0) searchParams.sort = JSON.stringify(params.sort)
  if (params.filters) searchParams.filters = params.filters

  const arrayParams = new URLSearchParams(searchParams)
  params.status?.forEach((value) => arrayParams.append('status', value))
  params.codeProvider?.forEach((value) => arrayParams.append('code_provider', value))

  const res = await get<PaginatedResponse<unknown>>('/ai-employees', {
    searchParams: arrayParams,
  })
  return { ...res, data: aiEmployeeListSchema.parse(res.data) }
}

export async function getAiEmployeeDetail(id: number) {
  const res = await get<unknown>(`/ai-employees/${id}`)
  return aiEmployeeSchema.parse(res)
}

export async function createAiEmployee(data: AiEmployeeMutation) {
  const payload = aiEmployeeMutationSchema.parse(data)
  const res = await post<unknown>('/ai-employees', { json: payload })
  return aiEmployeeSchema.parse(res)
}

export async function updateAiEmployee(id: number, data: AiEmployeeMutation) {
  const payload = aiEmployeeMutationSchema.parse(data)
  const res = await patch<unknown>(`/ai-employees/${id}`, { json: payload })
  return aiEmployeeSchema.parse(res)
}

export async function deleteAiEmployees(ids: number[]) {
  return del<null>('/ai-employees', { json: { ids } })
}

export async function getAiEmployeeWorkflows(aiEmployeeId: number) {
  const res = await get<unknown>(`/ai-employees/${aiEmployeeId}/workflows`)
  return workflowListSchema.parse(res)
}

export async function updateAiEmployeeWorkflows(
  aiEmployeeId: number,
  data: AiEmployeeWorkflowIdsMutation
) {
  const payload = aiEmployeeWorkflowIdsMutationSchema.parse(data)
  const res = await patch<unknown>(`/ai-employees/${aiEmployeeId}/workflows`, { json: payload })
  return workflowListSchema.parse(res)
}

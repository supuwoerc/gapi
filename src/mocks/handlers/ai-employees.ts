import type {
  AiEmployeeMutation,
  AiEmployeeWorkflowIdsMutation,
} from '@/schema/ai-employee/ai-employee'
import {
  aiEmployeeMutationSchema,
  aiEmployeeWorkflowIdsMutationSchema,
} from '@/schema/ai-employee/ai-employee'
import { delay, http } from 'msw'

import {
  aiEmployees,
  createAiEmployee,
  deleteAiEmployees,
  getAiEmployeeWorkflows,
  updateAiEmployee,
  updateAiEmployeeWorkflows,
} from '../data/ai-employees'
import { paginate } from '../utils/filter'
import { errorEnvelope, jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

function getAiEmployeeId(value: string | readonly string[] | undefined) {
  return Number(Array.isArray(value) ? value[0] : value)
}

export const aiEmployeeHandlers = [
  http.get(`${BASE}/ai-employees`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 10)
    const keyword = url.searchParams.get('keyword')?.toLowerCase().trim() ?? ''
    const statuses = new Set(url.searchParams.getAll('status'))
    const providers = new Set(url.searchParams.getAll('code_provider'))

    const result = aiEmployees.filter((employee) => {
      if (
        keyword &&
        !employee.name.toLowerCase().includes(keyword) &&
        !employee.description.toLowerCase().includes(keyword)
      ) {
        return false
      }

      if (statuses.size > 0 && !statuses.has(employee.status)) return false
      if (providers.size > 0 && !providers.has(employee.code_provider)) return false
      return true
    })

    return jsonEnvelope(paginate(result, page, perPage))
  }),

  http.post(`${BASE}/ai-employees`, async ({ request }) => {
    await delay(300)
    const body = aiEmployeeMutationSchema.parse((await request.json()) as AiEmployeeMutation)
    const employee = createAiEmployee(body)

    return jsonEnvelope(employee)
  }),

  http.get(`${BASE}/ai-employees/:id`, async ({ params }) => {
    await delay(200)
    const id = getAiEmployeeId(params.id)
    const employee = aiEmployees.find((item) => item.id === id)

    if (!employee) {
      return errorEnvelope(400404, 'AI employee not found')
    }

    return jsonEnvelope(employee)
  }),

  http.patch(`${BASE}/ai-employees/:id`, async ({ params, request }) => {
    await delay(300)
    const id = getAiEmployeeId(params.id)
    const body = aiEmployeeMutationSchema.parse((await request.json()) as AiEmployeeMutation)
    const employee = updateAiEmployee(id, body)

    if (!employee) {
      return errorEnvelope(400404, 'AI employee not found')
    }

    return jsonEnvelope(employee)
  }),

  http.delete(`${BASE}/ai-employees`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { ids?: number[] }
    deleteAiEmployees(body.ids ?? [])

    return jsonEnvelope(null)
  }),

  http.get(`${BASE}/ai-employees/:id/workflows`, async ({ params }) => {
    await delay(200)
    const id = getAiEmployeeId(params.id)
    const employee = aiEmployees.find((item) => item.id === id)

    if (!employee) {
      return errorEnvelope(400404, 'AI employee not found')
    }

    return jsonEnvelope(getAiEmployeeWorkflows(id))
  }),

  http.patch(`${BASE}/ai-employees/:id/workflows`, async ({ params, request }) => {
    await delay(300)
    const id = getAiEmployeeId(params.id)
    const body = aiEmployeeWorkflowIdsMutationSchema.parse(
      (await request.json()) as AiEmployeeWorkflowIdsMutation
    )
    const workflows = updateAiEmployeeWorkflows(id, body.workflow_ids)

    if (!workflows) {
      return errorEnvelope(400404, 'AI employee or employee workflow not found')
    }

    return jsonEnvelope(workflows)
  }),
]

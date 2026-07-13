import type { WorkflowMutation } from '@/schema/workflow/workflow'
import { delay, http } from 'msw'

import {
  createWorkflowWithFlow,
  getWorkflowDetail,
  updateWorkflowWithFlow,
  workflows,
} from '../data/workflows'
import { paginate } from '../utils/filter'
import { errorEnvelope, jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const workflowHandlers = [
  http.get(`${BASE}/workflows`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 20)
    const keyword = url.searchParams.get('keyword')?.toLowerCase().trim() ?? ''
    const type = url.searchParams.get('type')
    const filteredByType =
      type === 'project' || type === 'employee'
        ? workflows.filter((workflow) => workflow.type === type)
        : workflows
    const result = keyword
      ? filteredByType.filter(
          (workflow) =>
            workflow.name.toLowerCase().includes(keyword) ||
            workflow.description.toLowerCase().includes(keyword)
        )
      : filteredByType

    return jsonEnvelope(paginate(result, page, perPage))
  }),

  http.post(`${BASE}/workflows`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as WorkflowMutation
    const workflow = createWorkflowWithFlow(body)

    return jsonEnvelope(workflow)
  }),

  http.get(`${BASE}/workflows/:id`, async ({ params }) => {
    await delay(200)
    const id = Number(params.id)
    const workflow = getWorkflowDetail(id)

    if (!workflow) {
      return errorEnvelope(404, 'Workflow not found')
    }

    return jsonEnvelope({ data: workflow })
  }),

  http.patch(`${BASE}/workflows/:id`, async ({ params, request }) => {
    await delay(300)
    const id = Number(params.id)
    const body = (await request.json()) as WorkflowMutation
    const workflow = updateWorkflowWithFlow(id, body)

    if (!workflow) {
      return errorEnvelope(404, 'Workflow not found')
    }

    return jsonEnvelope(workflow)
  }),
]

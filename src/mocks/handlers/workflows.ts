import { delay, http } from 'msw'

import { getWorkflowDetail, workflows } from '../data/workflows'
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
    const result = keyword
      ? workflows.filter(
          (workflow) =>
            workflow.name.toLowerCase().includes(keyword) ||
            workflow.description.toLowerCase().includes(keyword)
        )
      : workflows

    return jsonEnvelope(paginate(result, page, perPage))
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
]

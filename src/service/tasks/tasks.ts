import { taskListSchema } from '@/schema/tasks/tasks'

import { get } from '@/lib/http'

import type { GetTasksParams, GetTasksResponse } from './dto/tasks'

export async function getTasks(params: GetTasksParams) {
  const searchParams: Record<string, string> = {
    page: String(params.page),
    perPage: String(params.perPage),
  }

  if (params.title) searchParams.title = params.title
  if (params.sort.length > 0) searchParams.sort = JSON.stringify(params.sort)
  if (params.filters) searchParams.filters = params.filters

  const arrayParams = new URLSearchParams(searchParams)
  params.level?.forEach((v) => arrayParams.append('level', v))
  params.type?.forEach((v) => arrayParams.append('type', v))

  const res = await get<GetTasksResponse>('/tasks', { searchParams: arrayParams })
  return { ...res, data: taskListSchema.parse(res.data) }
}

import { getTasks as _getTasks } from '@/mocks/tasks/api'
import { taskListSchema } from '@/schema/tasks/tasks'

import type { GetTasksParams } from './dto/tasks'

export async function getTasks(params: GetTasksParams) {
  const res = await _getTasks(params)
  return { ...res, data: taskListSchema.parse(res.data) }
}

import type { Task } from '@/schema/tasks/tasks'
import type { AdvancedFilter, GetTasksParams, GetTasksResponse } from '@/service/tasks/dto/tasks'
import { faker } from '@faker-js/faker'

faker.seed(12345)

const tasks = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  level: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'] as const),
  type: faker.helpers.arrayElement(['bug', 'feature', 'improvement', 'task'] as const),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  creator: faker.person.fullName(),
  assignee: faker.person.fullName(),
  resolver: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.7 }) ?? '',
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
  deleted_at: null,
}))

function applyAdvancedFilter(data: Task[], filter: AdvancedFilter): Task[] {
  const { id, value, operator } = filter
  const key = id as keyof Task

  if (operator === 'isEmpty') {
    return data.filter((t) => !t[key])
  }
  if (operator === 'isNotEmpty') {
    return data.filter((t) => !!t[key])
  }

  if (Array.isArray(value)) {
    if (operator === 'inArray') {
      return data.filter((t) => value.includes(String(t[key])))
    }
    if (operator === 'notInArray') {
      return data.filter((t) => !value.includes(String(t[key])))
    }
    if (operator === 'isBetween' && value.length === 2) {
      return data.filter((t) => {
        const v = t[key] instanceof Date ? t[key].getTime() : Number(t[key])
        return v >= Number(value[0]) && v <= Number(value[1])
      })
    }
    return data
  }

  const strValue = String(value).toLowerCase()
  return data.filter((t) => {
    const fieldVal = t[key]
    const fieldStr = String(fieldVal).toLowerCase()
    const fieldNum = fieldVal instanceof Date ? fieldVal.getTime() : Number(fieldVal)

    switch (operator) {
      case 'iLike':
        return fieldStr.includes(strValue)
      case 'notILike':
        return !fieldStr.includes(strValue)
      case 'eq':
        return fieldStr === strValue
      case 'ne':
        return fieldStr !== strValue
      case 'lt':
        return fieldNum < Number(value)
      case 'lte':
        return fieldNum <= Number(value)
      case 'gt':
        return fieldNum > Number(value)
      case 'gte':
        return fieldNum >= Number(value)
      default:
        return true
    }
  })
}

export async function getTasks(params: GetTasksParams): Promise<GetTasksResponse> {
  await new Promise((r) => setTimeout(r, 200))

  let result = tasks as Task[]

  if (params.title) {
    const keyword = params.title.toLowerCase()
    result = result.filter((t) => t.title.toLowerCase().includes(keyword))
  }

  if (params.level?.length) {
    result = result.filter((t) => params.level!.includes(t.level))
  }

  if (params.type?.length) {
    result = result.filter((t) => params.type!.includes(t.type))
  }

  if (params.filters) {
    try {
      const parsed = JSON.parse(params.filters) as AdvancedFilter[]
      for (const filter of parsed) {
        result = applyAdvancedFilter(result, filter)
      }
    } catch {
      // ignore malformed filters
    }
  }

  if (params.sort.length > 0) {
    result = [...result].sort((a, b) => {
      for (const { id, desc } of params.sort) {
        const aVal = a[id as keyof Task] ?? ''
        const bVal = b[id as keyof Task] ?? ''
        if (aVal < bVal) return desc ? 1 : -1
        if (aVal > bVal) return desc ? -1 : 1
      }
      return 0
    })
  } else {
    result = [...result].sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
  }

  const total = result.length
  const start = (params.page - 1) * params.perPage
  const data = result.slice(start, start + params.perPage)

  return { data, total }
}

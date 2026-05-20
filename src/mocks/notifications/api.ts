import type { Notification } from '@/schema/notifications/notifications'
import type {
  DeleteNotificationsParams,
  GetNotificationsParams,
  GetNotificationsResponse,
  MarkNotificationsReadParams,
} from '@/service/notifications/dto/list'
import type {
  UpdateNotificationsParams,
  UpdateNotificationsResponse,
} from '@/service/notifications/dto/notifications'
import { faker } from '@faker-js/faker'

faker.seed(54321)

const notifications: Notification[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  title: faker.lorem.sentence({ min: 3, max: 10 }),
  content: faker.lorem.paragraphs({ min: 2, max: 5 }),
  type: faker.helpers.arrayElement(['system', 'task', 'message', 'alert'] as const),
  sender: faker.person.fullName(),
  is_read: faker.datatype.boolean({ probability: 0.4 }),
  created_at: faker.date.recent({ days: 30 }),
}))

interface AdvancedFilter {
  id: string
  value: string | string[]
  variant: string
  operator: string
  filterId: string
}

function applyAdvancedFilter(data: Notification[], filter: AdvancedFilter): Notification[] {
  const { id, value, operator } = filter
  const key = id as keyof Notification

  if (operator === 'isEmpty') {
    return data.filter((n) => !n[key])
  }
  if (operator === 'isNotEmpty') {
    return data.filter((n) => !!n[key])
  }

  if (Array.isArray(value)) {
    if (operator === 'inArray') {
      return data.filter((n) => value.includes(String(n[key])))
    }
    if (operator === 'notInArray') {
      return data.filter((n) => !value.includes(String(n[key])))
    }
    if (operator === 'isBetween' && value.length === 2) {
      return data.filter((n) => {
        const v = n[key] instanceof Date ? n[key].getTime() : Number(n[key])
        return v >= Number(value[0]) && v <= Number(value[1])
      })
    }
    return data
  }

  const strValue = String(value).toLowerCase()
  return data.filter((n) => {
    const fieldVal = n[key]
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

export async function getNotifications(
  params: GetNotificationsParams
): Promise<GetNotificationsResponse> {
  await new Promise((r) => setTimeout(r, 200))

  let result = notifications as Notification[]

  if (params.title) {
    const keyword = params.title.toLowerCase()
    result = result.filter((n) => n.title.toLowerCase().includes(keyword))
  }

  if (params.type?.length) {
    result = result.filter((n) => params.type!.includes(n.type))
  }

  if (params.is_read?.length) {
    result = result.filter((n) => params.is_read!.includes(String(n.is_read)))
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
        const aVal = a[id as keyof Notification] ?? ''
        const bVal = b[id as keyof Notification] ?? ''
        if (aVal < bVal) return desc ? 1 : -1
        if (aVal > bVal) return desc ? -1 : 1
      }
      return 0
    })
  } else {
    result = [...result].sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  }

  const total = result.length
  const start = (params.page - 1) * params.perPage
  const data = result.slice(start, start + params.perPage)

  return { data, total }
}

export async function markNotificationsRead(
  params: MarkNotificationsReadParams
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 300))
  for (const id of params.ids) {
    const notification = notifications.find((n) => n.id === id)
    if (notification) {
      notification.is_read = true
    }
  }
  return { success: true }
}

export async function deleteNotifications(
  params: DeleteNotificationsParams
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 300))
  const idsSet = new Set(params.ids)
  const indicesToRemove = notifications
    .map((n, i) => (idsSet.has(n.id) ? i : -1))
    .filter((i) => i !== -1)
    .reverse()
  for (const i of indicesToRemove) {
    notifications.splice(i, 1)
  }
  return { success: true }
}

export async function getNotificationDetail(id: number): Promise<Notification> {
  await new Promise((r) => setTimeout(r, 200))
  const notification = notifications.find((n) => n.id === id)
  if (!notification) {
    throw new Error('Notification not found')
  }
  notification.is_read = true
  return notification
}

export async function updateNotifications(
  params: UpdateNotificationsParams
): Promise<UpdateNotificationsResponse> {
  await new Promise((r) => setTimeout(r, 800))
  return {
    taskEmail: params.taskEmail,
    messageEmail: params.messageEmail,
    versionUpdate: params.versionUpdate,
    security: params.security,
  }
}

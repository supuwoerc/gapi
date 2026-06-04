import { delay, http } from 'msw'

import { notifications } from '../data/notifications'
import { applyAdvancedFilters, applySorting, paginate } from '../utils/filter'
import { errorEnvelope, jsonEnvelope } from '../utils/response'

const BASE = import.meta.env.VITE_APP_DEFAULT_SERVER

export const notificationsHandlers = [
  http.get(`${BASE}/notifications`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const perPage = Number(url.searchParams.get('perPage') ?? 10)
    const title = url.searchParams.get('title') ?? ''
    const type = url.searchParams.getAll('type')
    const isRead = url.searchParams.getAll('is_read')
    const sort = url.searchParams.get('sort')
    const filters = url.searchParams.get('filters') ?? undefined

    let result = [...notifications]

    if (title) {
      const keyword = title.toLowerCase()
      result = result.filter((n) => n.title.toLowerCase().includes(keyword))
    }

    if (type.length) {
      result = result.filter((n) => type.includes(n.type))
    }

    if (isRead.length) {
      result = result.filter((n) => isRead.includes(String(n.is_read)))
    }

    result = applyAdvancedFilters(result, filters)

    const sortArr: { id: string; desc: boolean }[] = sort ? JSON.parse(sort) : []
    if (sortArr.length > 0) {
      result = applySorting(result, sortArr)
    } else {
      result.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    }

    const paged = paginate(result, page, perPage)
    return jsonEnvelope(paged)
  }),

  http.get(`${BASE}/notifications/:id`, async ({ params }) => {
    await delay(200)
    const id = Number(params.id)
    const notification = notifications.find((n) => n.id === id)

    if (!notification) {
      return errorEnvelope(404, 'Notification not found')
    }

    notification.is_read = true
    return jsonEnvelope(notification)
  }),

  http.post(`${BASE}/notifications/mark-read`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { ids: number[] }
    for (const id of body.ids) {
      const notification = notifications.find((n) => n.id === id)
      if (notification) {
        notification.is_read = true
      }
    }
    return jsonEnvelope({ success: true })
  }),

  http.delete(`${BASE}/notifications`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { ids: number[] }
    const idsSet = new Set(body.ids)
    const indicesToRemove = notifications
      .map((n, i) => (idsSet.has(n.id) ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
    for (const i of indicesToRemove) {
      notifications.splice(i, 1)
    }
    return jsonEnvelope({ success: true })
  }),

  http.put(`${BASE}/notifications/settings`, async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as {
      taskEmail: boolean
      messageEmail: boolean
      versionUpdate: boolean
      security: boolean
    }
    return jsonEnvelope(body)
  }),
]

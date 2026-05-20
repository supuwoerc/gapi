import type { Notification } from '@/schema/notifications/notifications'

export interface GetNotificationsParams {
  page: number
  perPage: number
  sort: { id: string; desc: boolean }[]
  title?: string
  type?: string[]
  is_read?: string[]
  filters?: string
}

export interface GetNotificationsResponse {
  data: Notification[]
  total: number
}

export interface MarkNotificationsReadParams {
  ids: number[]
}

export interface DeleteNotificationsParams {
  ids: number[]
}

export interface GetNotificationDetailParams {
  id: number
}

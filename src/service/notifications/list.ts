import {
  deleteNotifications as _deleteNotifications,
  getNotificationDetail as _getNotificationDetail,
  getNotifications as _getNotifications,
  markNotificationsRead as _markNotificationsRead,
} from '@/mocks/notifications/api'
import { notificationListSchema, notificationSchema } from '@/schema/notifications/notifications'

import type {
  DeleteNotificationsParams,
  GetNotificationDetailParams,
  GetNotificationsParams,
  MarkNotificationsReadParams,
} from './dto/list'

export async function getNotifications(params: GetNotificationsParams) {
  const res = await _getNotifications(params)
  return { ...res, data: notificationListSchema.parse(res.data) }
}

export async function getNotificationDetail(params: GetNotificationDetailParams) {
  const res = await _getNotificationDetail(params.id)
  return notificationSchema.parse(res)
}

export async function markNotificationsRead(params: MarkNotificationsReadParams) {
  return _markNotificationsRead(params)
}

export async function deleteNotifications(params: DeleteNotificationsParams) {
  return _deleteNotifications(params)
}

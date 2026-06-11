import { authHandlers } from './auth'
import { captchaHandlers } from './captcha'
import { menuHandlers } from './menu'
import { notificationsHandlers } from './notifications'
import { roleHandlers } from './roles'
import { taskHandlers } from './tasks'
import { taskDetailHandlers } from './tasks-detail'
import { userProfileHandlers } from './user'
import { userHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...captchaHandlers,
  ...menuHandlers,
  ...notificationsHandlers,
  ...roleHandlers,
  ...taskHandlers,
  ...taskDetailHandlers,
  ...userProfileHandlers,
  ...userHandlers,
]

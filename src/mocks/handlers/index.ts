import { authHandlers } from './auth'
import { captchaHandlers } from './captcha'
import { menuHandlers } from './menu'
import { notificationsHandlers } from './notifications'
import { profileHandlers } from './profile'
import { taskHandlers } from './tasks'
import { taskDetailHandlers } from './tasks-detail'
import { tourHandlers } from './tour'
import { userHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...captchaHandlers,
  ...menuHandlers,
  ...notificationsHandlers,
  ...profileHandlers,
  ...taskHandlers,
  ...taskDetailHandlers,
  ...tourHandlers,
  ...userHandlers,
]

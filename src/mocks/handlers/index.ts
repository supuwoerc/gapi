import { authHandlers } from './auth'
import { menuHandlers } from './menu'
import { notificationsHandlers } from './notifications'
import { profileHandlers } from './profile'
import { taskHandlers } from './tasks'
import { taskDetailHandlers } from './tasks-detail'
import { tourHandlers } from './tour'
import { userHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...menuHandlers,
  ...notificationsHandlers,
  ...profileHandlers,
  ...taskHandlers,
  ...taskDetailHandlers,
  ...tourHandlers,
  ...userHandlers,
]

import { authHandlers } from './auth'
import { captchaHandlers } from './captcha'
import { documentHandlers } from './documents'
import { documentDetailHandlers } from './documents-detail'
import { menuHandlers } from './menu'
import { notificationsHandlers } from './notifications'
import { permissionHandlers } from './permissions'
import { projectHandlers } from './projects'
import { roleHandlers } from './roles'
import { selectionCommentHandlers } from './selection-comments'
import { taskHandlers } from './tasks'
import { taskDetailHandlers } from './tasks-detail'
import { userProfileHandlers } from './user'
import { userHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...captchaHandlers,
  ...documentDetailHandlers,
  ...documentHandlers,
  ...menuHandlers,
  ...notificationsHandlers,
  ...permissionHandlers,
  ...projectHandlers,
  ...roleHandlers,
  ...selectionCommentHandlers,
  ...taskHandlers,
  ...taskDetailHandlers,
  ...userProfileHandlers,
  ...userHandlers,
]

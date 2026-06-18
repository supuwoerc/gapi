import type component from '../../public/locales/zh/component.json'
import type dashboard from '../../public/locales/zh/dashboard.json'
import type documents from '../../public/locales/zh/documents.json'
import type forbidden from '../../public/locales/zh/forbidden.json'
import type forgotPassword from '../../public/locales/zh/forgot-password.json'
import type global from '../../public/locales/zh/global.json'
import type login from '../../public/locales/zh/login.json'
import type notFound from '../../public/locales/zh/not-found.json'
import type notifications from '../../public/locales/zh/notifications.json'
import type otp from '../../public/locales/zh/otp.json'
import type permissions from '../../public/locales/zh/permissions.json'
import type projects from '../../public/locales/zh/projects.json'
import type roles from '../../public/locales/zh/roles.json'
import type route from '../../public/locales/zh/route.json'
import type serverError from '../../public/locales/zh/server-error.json'
import type settings from '../../public/locales/zh/settings.json'
import type signUp from '../../public/locales/zh/sign-up.json'
import type taskDetail from '../../public/locales/zh/task-detail.json'
import type tasks from '../../public/locales/zh/tasks.json'
import type users from '../../public/locales/zh/users.json'

export interface Resources {
  component: typeof component
  dashboard: typeof dashboard
  documents: typeof documents
  forbidden: typeof forbidden
  'forgot-password': typeof forgotPassword
  global: typeof global
  login: typeof login
  'not-found': typeof notFound
  notifications: typeof notifications
  otp: typeof otp
  permissions: typeof permissions
  projects: typeof projects
  roles: typeof roles
  route: typeof route
  'server-error': typeof serverError
  settings: typeof settings
  'sign-up': typeof signUp
  'task-detail': typeof taskDetail
  tasks: typeof tasks
  users: typeof users
}

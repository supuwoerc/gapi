import { redirect } from 'react-router'

import { useAuthStore } from '@/store/auth'

/**
 * 认证守卫 - 要求用户已登录
 * Auth guard - requires the user to be authenticated
 *
 * @description 用于需要登录才能访问的路由。未登录时重定向到登录页，并携带当前路径作为 redirect 参数。
 *              Used for routes that require authentication. Redirects unauthenticated users to the login page with the current path as a redirect parameter.
 * @param params - React Router loader 参数 / React Router loader params
 * @param params.request - 当前请求对象，用于提取目标路径 / Current request object, used to extract the target path
 */
export function requireAuth({ request }: { request: Request }) {
  const { loginUser } = useAuthStore.getState()
  if (!loginUser) {
    const url = new URL(request.url)
    const redirectTo = url.pathname + url.search + url.hash
    throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }
  return null
}

/**
 * 访客守卫 - 要求用户未登录
 * Guest guard - requires the user to be unauthenticated
 *
 * @description 用于登录页等仅限未登录用户访问的路由。已登录时重定向到首页。
 *              Used for routes accessible only to unauthenticated users (e.g., login page). Redirects authenticated users to the home page.
 */
export function requireGuest() {
  const { loginUser } = useAuthStore.getState()
  if (loginUser) {
    throw redirect('/')
  }
  return null
}

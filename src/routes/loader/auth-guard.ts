import { fetchUserProfile } from '@/service/auth/auth'
import { redirect } from 'react-router'

import { setLoginUser, useLoginUserStore } from '@/store/login-user'

import { reactQueryClient } from '@/lib/react-query'

export async function requireAuth({ request }: { request: Request }) {
  const { loginUser } = useLoginUserStore.getState()
  if (!loginUser) {
    const url = new URL(request.url)
    const redirectTo = url.pathname + url.search + url.hash
    throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  // 登录时已通过 setQueryData 预填缓存，此处仅在页面刷新等缓存失效时才实际请求
  const profile = await reactQueryClient.ensureQueryData({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  })
  setLoginUser(profile)

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
  const { loginUser } = useLoginUserStore.getState()
  if (loginUser) {
    throw redirect('/')
  }
  return null
}

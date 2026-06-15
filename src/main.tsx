import { StrictMode, useMemo } from 'react'

import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'

import asyncRoutes from '@/routes/async'
import publicRoutes from '@/routes/public'
import '@/style/index.css'
import { PostHogProvider } from '@posthog/react'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/all'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { useShallow } from 'zustand/react/shallow'

import { clearLoginUserState, setLoginUser, useLoginUserStore } from '@/store/login-user'
import { setSystemLanguage, useSystemConfigStore } from '@/store/system-config'

import { enableMsw } from '@/lib/env'
import { setAuthProvider } from '@/lib/http/auth-provider'
import { initI18n, onI18nLanguageChanged } from '@/lib/i18n'
import { initPostHog, posthog } from '@/lib/posthog'
import { reactQueryClient } from '@/lib/react-query'
import { getPermissionRoutes } from '@/lib/route'

import { ThemeProvider } from '@/context/theme-provider'

import { Toaster } from '@/components/ui/sonner'

function setupGsap() {
  gsap.registerPlugin(TextPlugin)
}

function setupAuth() {
  setAuthProvider({
    getToken: () => useLoginUserStore.getState().loginUser?.token ?? null,
    getRefreshToken: () => useLoginUserStore.getState().loginUser?.refresh_token ?? null,
    getLanguage: () => useSystemConfigStore.getState().language,
    onTokenRefreshed: (token, refreshToken) => {
      const { loginUser } = useLoginUserStore.getState()
      if (loginUser) {
        setLoginUser({ ...loginUser, token, refresh_token: refreshToken })
      }
    },
    onAuthFailed: () => clearLoginUserState(),
  })
}

function setupI18n() {
  initI18n(useSystemConfigStore.getState().language)
  onI18nLanguageChanged((lng) => setSystemLanguage(lng))
}

setupGsap()
setupAuth()
setupI18n()
initPostHog()

function App() {
  const isLogin = useLoginUserStore((state) => !!state.loginUser)
  const routePermissions = useLoginUserStore(
    useShallow((state) => state.loginUser?.route_permissions ?? [])
  )

  const router = useMemo(() => {
    const permissionRoutes = getPermissionRoutes(
      asyncRoutes,
      routePermissions,
      isLogin,
      () => import('@/feature/error/403')
    )
    return createBrowserRouter([...publicRoutes, ...permissionRoutes], {
      basename: import.meta.env.BASE_URL,
    })
  }, [isLogin, routePermissions])

  return <RouterProvider router={router} />
}

async function bootstrap() {
  if (import.meta.env.DEV && enableMsw) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const rootElement = document.getElementById('root')!

  if (!rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(
      <StrictMode>
        <QueryClientProvider client={reactQueryClient}>
          <PostHogProvider client={posthog}>
            <ThemeProvider>
              <Toaster duration={2200} position="top-center" />
              <App />
            </ThemeProvider>
          </PostHogProvider>
        </QueryClientProvider>
      </StrictMode>
    )
  }
}

bootstrap()

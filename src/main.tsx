import { StrictMode, useMemo } from 'react'

import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'

import asyncRoutes from '@/routes/async'
import publicRoutes from '@/routes/public'
import '@/style/index.css'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/all'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { useShallow } from 'zustand/react/shallow'

import { useLoginUserStore } from '@/store/login-user'

import { enableMsw } from '@/lib/env'
import '@/lib/i18n.ts'
import { reactQueryClient } from '@/lib/react-query'
import { getPermissionRoutes } from '@/lib/route'

import { ThemeProvider } from '@/context/theme-provider'

import { Toaster } from '@/components/ui/sonner'

gsap.registerPlugin(TextPlugin)

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
          <ThemeProvider>
            <Toaster duration={2200} position="top-center" />
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </StrictMode>
    )
  }
}

bootstrap()

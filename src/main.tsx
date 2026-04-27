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

import { useLoginUserStore } from '@/store/login-user'

import '@/lib/i18n.ts'
import { reactQueryClient } from '@/lib/react-query.ts'
import { getPermissionRoutes } from '@/lib/route'

import { ThemeProvider } from '@/context/theme-provider'

import { Toaster } from '@/components/ui/sonner'

gsap.registerPlugin(TextPlugin)

function App() {
  const loginUser = useLoginUserStore((state) => state.loginUser)

  const router = useMemo(() => {
    const routePermissions = loginUser?.routePermissions ?? []
    const isLogin = !!loginUser
    const permissionRoutes = getPermissionRoutes(
      asyncRoutes,
      routePermissions,
      isLogin,
      () => import('@/feature/error/403')
    )
    return createBrowserRouter([...publicRoutes, ...permissionRoutes])
  }, [loginUser])

  return <RouterProvider router={router} />
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

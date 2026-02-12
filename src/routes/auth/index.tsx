import type { CustomRouteObject } from '@/types/route'
import { Navigate, Outlet } from 'react-router'

import { loadComponent } from '@/utils/route'

import { RouteError } from '@/components/route-error/route-error'

const authRoutes: CustomRouteObject[] = [
  {
    path: '/',
    handle: {
      hidden: true,
      auth: 'anonymous',
    },
    element: <Outlet />,
    children: [
      {
        path: '',
        element: <Navigate to={'/login'} replace />,
      },
      {
        path: 'login',
        handle: {
          title: 'route.login',
          auth: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/components/layout/fullscreen/index')),
        children: [
          {
            path: '',
            lazy: loadComponent(() => import('@/feature/auth/login')),
          },
        ],
      },
    ],
  },
]

export default authRoutes

import type { CustomRouteObject } from '@/types/route'
import { Navigate } from 'react-router'

import { loadComponent } from '@/utils/route'

import { RouteError } from '@/components/route-error'

const authRoutes: CustomRouteObject[] = [
  {
    path: '',
    handle: {
      hidden: true,
      auth: 'anonymous',
    },
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/fullscreen'), {
      pure: true,
    }),
    children: [
      {
        path: '',
        errorElement: <RouteError />,
        element: <Navigate to={'/dashboard'} replace />,
      },
      {
        path: 'login',
        handle: {
          title: 'route.login',
          auth: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/auth/login')),
      },
      {
        path: 'forgot-password',
        handle: {
          title: 'route.forgotPassword',
          auth: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/auth/forgot-password')),
      },
      {
        path: 'otp',
        handle: {
          title: 'route.otp',
          auth: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/auth/otp')),
      },
    ],
  },
]

export default authRoutes

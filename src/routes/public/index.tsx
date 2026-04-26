import { requireGuest } from '@/routes/loader/auth-guard'
import type { CustomRouteObject } from '@/types/route'
import { Navigate } from 'react-router'

import { loadComponent } from '@/lib/route'

import { HydrateFallback } from '@/components/hydrate-fallback'
import { RouteError } from '@/components/route-error'

const publicRoutes: CustomRouteObject[] = [
  {
    path: '',
    handle: {
      hidden: true,
      authMode: 'anonymous',
      title: 'route:notFound',
    },
    HydrateFallback: HydrateFallback,
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
        loader: requireGuest,
        handle: {
          title: 'route:login',
          authMode: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/auth/login')),
      },
      {
        path: 'sign-up',
        loader: requireGuest,
        handle: {
          title: 'route:signUp',
          authMode: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/auth/sign-up')),
      },
      {
        path: 'forgot-password',
        handle: {
          title: 'route:forgotPassword',
          authMode: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/auth/forgot-password')),
      },
      {
        path: 'otp',
        handle: {
          title: 'route:otp',
          authMode: 'anonymous',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/auth/otp')),
      },
      {
        path: '500',
        handle: {
          hidden: true,
          authMode: 'anonymous',
          title: 'route:serverError',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/error/500.tsx')),
      },
      {
        path: '*',
        handle: {
          hidden: true,
          authMode: 'anonymous',
          title: 'route:notFound',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/error/404.tsx')),
      },
    ],
  },
]

export default publicRoutes

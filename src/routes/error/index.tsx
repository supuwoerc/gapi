import type { CustomRouteObject } from '@/types/route'

import { loadComponent } from '@/utils/route'

import { HydrateFallback } from '@/components/hydrate-fallback'
import { RouteError } from '@/components/route-error'

const errorRoutes: CustomRouteObject[] = [
  {
    path: '',
    handle: {
      hidden: true,
      auth: 'anonymous',
      title: 'route.notFound',
    },
    HydrateFallback: HydrateFallback,
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/fullscreen'), {
      pure: true,
    }),
    children: [
      {
        path: '500',
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/error/500.tsx')),
      },
      {
        path: '*',
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/error/404.tsx')),
      },
    ],
  },
]

export default errorRoutes

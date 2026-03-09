import type { CustomRouteObject } from '@/types/route'

import { loadComponent } from '@/utils/route'

import { RouteError } from '@/components/route-error'

const authenticatedRoutes: CustomRouteObject[] = [
  {
    path: '',
    handle: {
      hidden: true,
      auth: 'loginRequired',
    },
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/authenticated')),
    children: [
      {
        path: 'dashboard',
        handle: {
          title: 'route.dashboard',
          auth: 'loginRequired',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/dashboard/index'), {
          pure: true,
        }),
      },
    ],
  },
]

export default authenticatedRoutes

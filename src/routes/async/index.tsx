import type { CustomRouteObject } from '@/types/route'
import { Outlet } from 'react-router'

import { loadComponent } from '@/utils/route'

import { HydrateFallback } from '@/components/hydrate-fallback'
import { RouteError } from '@/components/route-error'

const asyncRoutes: CustomRouteObject[] = [
  {
    path: '',
    handle: {
      hidden: true,
      auth: 'loginRequired',
      group: 'route.general.name',
    },
    HydrateFallback: HydrateFallback,
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/authenticated')),
    children: [
      {
        path: '/dashboard',
        handle: {
          title: 'route.general.dashboard',
          auth: 'loginRequired',
          icon: 'layout-dashboard',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/dashboard/index'), {
          pure: true,
        }),
      },
      {
        path: '/tasks',
        handle: {
          title: 'route.general.tasks',
          auth: 'loginRequired',
          icon: 'list-todo',
          badge: 3,
        },
        errorElement: <RouteError />,
        element: 'tasks',
      },
      {
        path: '/notifications',
        handle: {
          title: 'route.general.notifications',
          auth: 'loginRequired',
          icon: 'bell',
          badge: 110,
        },
        errorElement: <RouteError />,
        element: 'notifications',
      },
    ],
  },
  {
    path: '',
    handle: {
      hidden: true,
      auth: 'loginRequired',
      group: 'route.pages.name',
    },
    HydrateFallback: HydrateFallback,
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/authenticated')),
    children: [
      {
        path: '/groups',
        handle: {
          title: 'route.pages.groups',
          auth: 'loginRequired',
          icon: 'boxes',
        },
        errorElement: <RouteError />,
        element: 'groups',
      },
      {
        path: '/projects',
        handle: {
          title: 'route.pages.projects',
          auth: 'loginRequired',
          icon: 'panels-top-left',
        },
        errorElement: <RouteError />,
        element: 'projects',
      },
      {
        path: '/documents',
        handle: {
          title: 'route.pages.documents',
          auth: 'loginRequired',
          icon: 'file-code',
        },
        errorElement: <RouteError />,
        element: 'documents',
      },
    ],
  },
  {
    path: '',
    handle: {
      hidden: true,
      auth: 'loginRequired',
      group: 'route.other.name',
    },
    HydrateFallback: HydrateFallback,
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/authenticated')),
    children: [
      {
        path: '/admin',
        handle: {
          title: 'route.other.admin.name',
          auth: 'loginRequired',
          icon: 'user-star',
        },
        errorElement: <RouteError />,
        element: <Outlet />,
        children: [
          {
            path: '/admin/users',
            handle: {
              title: 'route.other.admin.users',
              auth: 'loginRequired',
              icon: 'users',
            },
            errorElement: <RouteError />,
            element: 'users',
          },
          {
            path: '/admin/roles',
            handle: {
              title: 'route.other.admin.roles',
              auth: 'loginRequired',
              icon: 'hat-glasses',
            },
            errorElement: <RouteError />,
            element: 'roles',
          },
          {
            path: '/admin/permissions',
            handle: {
              title: 'route.other.admin.permissions',
              auth: 'loginRequired',
              icon: 'key-round',
            },
            errorElement: <RouteError />,
            element: 'roles',
          },
        ],
      },
    ],
  },
]

export default asyncRoutes

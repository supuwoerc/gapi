import { requireAuth } from '@/routes/loader/auth-guard'
import { withPermissions } from '@/routes/loader/permission-guard'
import type { CustomRouteObject } from '@/types/route'
import { Outlet } from 'react-router'

import { loadComponent } from '@/lib/route'

import { HydrateFallback } from '@/components/hydrate-fallback'
import { RouteError } from '@/components/route-error'

const asyncRoutes: CustomRouteObject[] = [
  {
    path: '',
    loader: requireAuth,
    handle: {
      hidden: true,
      authMode: 'loginRequired',
      group: 'route:general.name',
    },
    HydrateFallback: HydrateFallback,
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/authenticated')),
    children: [
      {
        path: '/dashboard',
        loader: withPermissions('dashboard'),
        handle: {
          title: 'route:general.dashboard',
          authMode: 'permissionRequired',
          key: 'dashboard',
          icon: 'layout-dashboard',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/dashboard/index'), {
          pure: true,
        }),
      },
      {
        path: '/tasks',
        loader: withPermissions('tasks'),
        handle: {
          title: 'route:general.tasks',
          authMode: 'permissionRequired',
          key: 'tasks',
          icon: 'list-todo',
        },
        errorElement: <RouteError />,
        element: 'tasks',
      },
      {
        path: '/notifications',
        loader: withPermissions('notifications'),
        handle: {
          title: 'route:general.notifications',
          authMode: 'permissionRequired',
          key: 'notifications',
          icon: 'bell',
        },
        errorElement: <RouteError />,
        element: 'notifications',
      },
    ],
  },
  {
    path: '',
    loader: requireAuth,
    handle: {
      hidden: true,
      authMode: 'loginRequired',
      group: 'route:pages.name',
    },
    HydrateFallback: HydrateFallback,
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/authenticated')),
    children: [
      {
        path: '/groups',
        loader: withPermissions('groups'),
        handle: {
          title: 'route:pages.groups',
          authMode: 'permissionRequired',
          key: 'groups',
          icon: 'boxes',
        },
        errorElement: <RouteError />,
        element: 'groups',
      },
      {
        path: '/projects',
        loader: withPermissions('projects'),
        handle: {
          title: 'route:pages.projects',
          authMode: 'permissionRequired',
          key: 'projects',
          icon: 'panels-top-left',
        },
        errorElement: <RouteError />,
        element: 'projects',
      },
      {
        path: '/documents',
        loader: withPermissions('documents'),
        handle: {
          title: 'route:pages.documents',
          authMode: 'permissionRequired',
          key: 'documents',
          icon: 'file-code',
        },
        errorElement: <RouteError />,
        element: 'documents',
      },
    ],
  },
  {
    path: '',
    loader: requireAuth,
    handle: {
      hidden: true,
      authMode: 'loginRequired',
      group: 'route:other.name',
    },
    HydrateFallback: HydrateFallback,
    errorElement: <RouteError />,
    lazy: loadComponent(() => import('@/components/layout/authenticated')),
    children: [
      {
        path: '/admin',
        loader: withPermissions('admin'),
        handle: {
          title: 'route:other.admin.name',
          authMode: 'permissionRequired',
          key: 'admin',
          icon: 'user-star',
        },
        errorElement: <RouteError />,
        element: <Outlet />,
        children: [
          {
            path: '/admin/users',
            handle: {
              title: 'route:other.admin.users',
              authMode: 'permissionRequired',
              key: 'admin:users',
              icon: 'users',
            },
            errorElement: <RouteError />,
            lazy: loadComponent(() => import('@/feature/authenticated/admin/users')),
          },
          {
            path: '/admin/roles',
            handle: {
              title: 'route:other.admin.roles',
              authMode: 'permissionRequired',
              key: 'admin:roles',
              icon: 'hat-glasses',
            },
            errorElement: <RouteError />,
            element: 'roles',
          },
          {
            path: '/admin/permissions',
            handle: {
              title: 'route:other.admin.permissions',
              authMode: 'permissionRequired',
              key: 'admin:permissions',
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

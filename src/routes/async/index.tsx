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
        lazy: loadComponent(() => import('@/feature/authenticated/tasks/index'), {
          pure: true,
        }),
      },
      {
        path: '/task/:id',
        loader: withPermissions('tasks'),
        handle: {
          title: 'route:general.taskDetail',
          authMode: 'permissionRequired',
          key: 'tasks',
          hidden: true,
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/tasks/detail')),
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
        lazy: loadComponent(() => import('@/feature/authenticated/notifications/index'), {
          pure: true,
        }),
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
        path: '/projects',
        loader: withPermissions('projects'),
        handle: {
          title: 'route:pages.projects',
          authMode: 'permissionRequired',
          key: 'projects',
          icon: 'panels-top-left',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/projects')),
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
        lazy: loadComponent(() => import('@/feature/authenticated/documents')),
      },
      {
        path: '/document/:id',
        loader: withPermissions('documents'),
        handle: {
          title: 'route:pages.documentDetail',
          authMode: 'permissionRequired',
          key: 'documents',
          hidden: true,
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/documents/detail')),
      },
      {
        path: '/workflow',
        loader: withPermissions('workflow'),
        handle: {
          title: 'route:pages.workflow',
          authMode: 'permissionRequired',
          key: 'workflow',
          icon: 'workflow',
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/workflows')),
      },
      {
        path: '/workflow/create',
        loader: withPermissions('workflow'),
        handle: {
          title: 'route:pages.workflowCreate',
          authMode: 'permissionRequired',
          key: 'workflow',
          hidden: true,
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/workflows/create')),
      },
      {
        path: '/workflow/:id',
        loader: withPermissions('workflow'),
        handle: {
          title: 'route:pages.workflowDetail',
          authMode: 'permissionRequired',
          key: 'workflow',
          hidden: true,
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/workflows/detail')),
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
            lazy: loadComponent(() => import('@/feature/authenticated/admin/roles')),
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
            lazy: loadComponent(() => import('@/feature/authenticated/admin/permissions')),
          },
        ],
      },
      {
        path: '/settings',
        loader: requireAuth,
        handle: {
          title: 'route:other.accountSettings.name',
          authMode: 'loginRequired',
          icon: 'settings',
          hasLayout: true,
        },
        errorElement: <RouteError />,
        lazy: loadComponent(() => import('@/feature/authenticated/settings/layout')),
        children: [
          {
            index: true,
            handle: {
              title: 'route:other.accountSettings.profile',
              authMode: 'loginRequired',
              icon: 'user',
            },
            errorElement: <RouteError />,
            lazy: loadComponent(() => import('@/feature/authenticated/settings/profile')),
          },
          {
            path: '/settings/notifications',
            handle: {
              title: 'route:other.accountSettings.notifications',
              authMode: 'loginRequired',
              icon: 'bell',
            },
            errorElement: <RouteError />,
            lazy: loadComponent(() => import('@/feature/authenticated/settings/notifications')),
          },
        ],
      },
    ],
  },
]

export default asyncRoutes

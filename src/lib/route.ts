import { type ComponentProps, type ComponentType, createElement } from 'react'

import type { CustomRouteObject } from '@/types/route'

export const loadComponent = <T extends ComponentType>(
  loadComponent: () => Promise<{ default: T }>,
  props?: ComponentProps<T>
) => {
  return () => {
    return loadComponent().then((m) => ({
      element: createElement(m.default, props),
    }))
  }
}

/**
 * 根据权限递归处理路由树，无权限的路由替换为 403 页面
 * Recursively processes the route tree based on permissions, replacing unauthorized routes with the 403 page
 *
 * @param routes - 原始路由配置 / Original route configuration
 * @param permissions - 用户的路由权限列表，与 route.handle.key 匹配 / User route permission list, matched against route.handle.key
 * @param isLogin - 用户是否已登录 / Whether the user is authenticated
 * @param forbidden - 403 页面的懒加载函数 / Lazy-load function for the 403 page
 * @returns 处理后的路由配置（不修改原始数组） / Processed route configuration (does not mutate the original array)
 */
export function getPermissionRoutes(
  routes: CustomRouteObject[],
  permissions: string[],
  isLogin: boolean,
  forbidden: () => Promise<{ default: ComponentType }>
): CustomRouteObject[] {
  return routes.map((route) => {
    const authMode = route.handle?.authMode ?? 'anonymous'

    let hasPermission = false
    if (authMode === 'anonymous') {
      hasPermission = true
    } else if (authMode === 'loginRequired') {
      hasPermission = isLogin
    } else if (authMode === 'permissionRequired') {
      hasPermission = isLogin && !!route.handle?.key && permissions.includes(route.handle.key)
    }

    const filteredChildren = route.children?.length
      ? getPermissionRoutes(route.children, permissions, isLogin, forbidden)
      : undefined

    if (!hasPermission) {
      const replaced = {
        ...route,
        lazy: loadComponent(forbidden),
        loader: undefined,
        element: undefined,
      }
      if (filteredChildren) {
        ;(replaced as Record<string, unknown>).children = filteredChildren
      }
      return replaced as CustomRouteObject
    }

    if (filteredChildren) {
      return { ...route, children: filteredChildren } as CustomRouteObject
    }
    return route
  })
}

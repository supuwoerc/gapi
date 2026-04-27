import { useMemo } from 'react'

import type { CollapsibleMenu, LinkMenu, Menu } from '@/schema/menu'
import type { CustomRouteObject } from '@/types/route'

interface UseSidebarMenuOptions {
  isLogin?: boolean
  badges?: Record<string, string | number>
}

/**
 * 根据路由配置和用户权限生成侧边栏菜单数据
 *
 * @param routes - 路由配置数组
 * @param permissions - 用户的菜单权限列表，与 route.handle.key 匹配
 * @param options - 可选配置（isLogin、badges）
 * @returns 分组后的菜单数据
 */
export function useSidebarMenu(
  routes: CustomRouteObject[],
  permissions: string[],
  options: UseSidebarMenuOptions = {}
) {
  const { isLogin = false, badges } = options

  return useMemo(
    () => generateMenus(routes, permissions, isLogin, badges),
    [routes, permissions, isLogin, badges]
  )
}

/** 将路由树转换为按 handle.group 分组的菜单结构 */
function generateMenus(
  routes: CustomRouteObject[],
  permissions: string[],
  isLogin: boolean,
  badges?: Record<string, string | number>
): Menu[] {
  return routes
    .filter((route) => route.handle?.group)
    .map((route) => ({
      title: route.handle!.group!,
      items: buildMenuItems(route.children ?? [], permissions, isLogin, badges),
    }))
    .filter((menu) => menu.items.length > 0)
}

/** 递归构建菜单项，过滤无权限和隐藏路由，处理嵌套子菜单 */
function buildMenuItems(
  routes: CustomRouteObject[],
  permissions: string[],
  isLogin: boolean,
  badges?: Record<string, string | number>
): (LinkMenu | CollapsibleMenu)[] {
  return routes
    .filter((route) => route.handle?.title && !route.handle.hidden)
    .filter((route) => checkPermission(route.handle!, permissions, isLogin))
    .sort((a, b) => (a.handle?.order ?? 0) - (b.handle?.order ?? 0))
    .map((route) => {
      const { handle, path: routePath } = route
      const children = route.children?.filter((c) => {
        return (
          c.handle?.title && !c.handle.hidden && checkPermission(c.handle!, permissions, isLogin)
        )
      })
      const badge = resolveBadge(handle?.key, handle?.badge, badges)
      if (children?.length) {
        return {
          title: handle!.title!,
          icon: handle!.icon,
          badge,
          items: children
            .sort((a, b) => (a.handle?.order ?? 0) - (b.handle?.order ?? 0))
            .map((child) => ({
              title: child.handle!.title!,
              url: child.path || '',
              icon: child.handle?.icon,
              badge: resolveBadge(child.handle?.key, child.handle?.badge, badges),
            })),
        } as CollapsibleMenu
      }
      return {
        title: handle!.title!,
        url: routePath || '',
        icon: handle!.icon,
        badge,
      } as LinkMenu
    })
}

/** 根据 authMode 检查用户是否有权访问该路由 */
function checkPermission(
  handle: NonNullable<CustomRouteObject['handle']>,
  permissions: string[],
  isLogin: boolean
): boolean {
  const auth = handle.authMode ?? 'anonymous'
  if (auth === 'anonymous') {
    return true
  }
  if (auth === 'loginRequired') {
    return isLogin
  }
  if (auth === 'permissionRequired') {
    return isLogin && !!handle.key && permissions.includes(handle.key)
  }
  return false
}

/** 解析徽章值，优先使用动态 badges，回退到静态 badge */
function resolveBadge(
  key?: string,
  staticBadge?: number,
  badges?: Record<string, string | number>
): string | undefined {
  const value = (key ? badges?.[key] : undefined) ?? staticBadge
  if (!value) {
    return undefined
  }
  return value != null ? String(value) : undefined
}

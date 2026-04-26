import type { IconName } from 'lucide-react/dynamic'
import type { IndexRouteObject, NonIndexRouteObject } from 'react-router'

import type { AuthMode } from '../schema/auth-mode'

export interface RouteHandle {
  handle?: {
    key?: string
    group?: string
    title?: string
    icon?: IconName
    hidden?: boolean
    order?: number
    badge?: number
    authMode: AuthMode
  }
}

type AppIndexRouteObject = Omit<IndexRouteObject, 'handle'> & RouteHandle

type AppNonIndexRouteObject = Omit<NonIndexRouteObject, 'children' | 'handle'> &
  RouteHandle & {
    children?: (AppIndexRouteObject | AppNonIndexRouteObject)[]
  }

export type CustomRouteObject = AppIndexRouteObject | AppNonIndexRouteObject

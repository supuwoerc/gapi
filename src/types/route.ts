import type { IconName } from 'lucide-react/dynamic'
import type { IndexRouteObject, NonIndexRouteObject } from 'react-router'

import type { Auth } from '../schema/auth'

export interface RouteHandle {
  handle?: {
    group?: string
    key?: string
    title?: string
    icon?: IconName
    hidden?: boolean
    order?: number
    badge?: number
    auth: Auth
  }
}

type AppIndexRouteObject = Omit<IndexRouteObject, 'handle'> & RouteHandle

type AppNonIndexRouteObject = Omit<NonIndexRouteObject, 'children' | 'handle'> &
  RouteHandle & {
    children?: (AppIndexRouteObject | AppNonIndexRouteObject)[]
  }

export type CustomRouteObject = AppIndexRouteObject | AppNonIndexRouteObject

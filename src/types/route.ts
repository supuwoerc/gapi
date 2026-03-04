import type { IndexRouteObject, NonIndexRouteObject } from 'react-router'

import type { Auth } from '../schema/auth'

export interface RouteHandle {
  handle?: {
    title?: string
    icon?: React.ReactNode
    hidden?: boolean
    auth: Auth
  }
}

type AppIndexRouteObject = Omit<IndexRouteObject, 'handle'> & RouteHandle

type AppNonIndexRouteObject = Omit<NonIndexRouteObject, 'children' | 'handle'> &
  RouteHandle & {
    children?: (AppIndexRouteObject | AppNonIndexRouteObject)[]
  }

export type CustomRouteObject = AppIndexRouteObject | AppNonIndexRouteObject

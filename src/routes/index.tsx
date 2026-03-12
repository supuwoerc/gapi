import type { CustomRouteObject } from '@/types/route'

import asyncRoutes from './async'
import publicRoutes from './public'

const routes: CustomRouteObject[] = [...publicRoutes, ...asyncRoutes]

export default routes

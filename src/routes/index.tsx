import type { CustomRouteObject } from '@/types/route'

import authRoutes from './auth'
import authenticatedRoutes from './authenticated'
import errorRoutes from './error'

const routes: CustomRouteObject[] = [...authRoutes, ...authenticatedRoutes, ...errorRoutes]

export default routes

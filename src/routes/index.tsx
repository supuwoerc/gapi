import type { CustomRouteObject } from '@/types/route'

import authRoutes from './auth'
import errorRoutes from './error'

const routes: CustomRouteObject[] = [...authRoutes, ...errorRoutes]

export default routes

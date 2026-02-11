import type { CustomRouteObject } from '@/types/route'

import authRoutes from './auth/index'

const routes: CustomRouteObject[] = [...authRoutes]

export default routes

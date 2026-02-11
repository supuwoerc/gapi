import basicRoutes from './module/basic'
import dashboardRoutes from './module/dashboard'
import settingRoutes from './module/setting'
import userRoutes from './module/user'

const routes = [...basicRoutes, ...dashboardRoutes, ...userRoutes, ...settingRoutes]
export default routes

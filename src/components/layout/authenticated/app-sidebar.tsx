import { useQuery } from '@tanstack/react-query'

import routes from '@/routes'
import { fetchMenuBadges } from '@/service/menu/menu'
import { useShallow } from 'zustand/react/shallow'

import { useLoginUserStore } from '@/store/login-user'
import { useSystemConfigStore } from '@/store/system-config'

import { useSidebarMenu } from '@/hooks/use-sidebar-menu'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import MenuGroup from './components/menu-group'
import RoleSwitcher from './components/role-switcher'
import SidebarUser from './components/sidebar-user'
import { roles } from './data/constant'

export function AppSidebar() {
  const [collapsible, variant] = useSystemConfigStore(
    useShallow((state) => {
      return [state.sidebar.collapsible, state.sidebar.variant]
    })
  )

  const isLogin = useLoginUserStore((state) => !!state.loginUser)
  const menuPermissions = useLoginUserStore(
    useShallow((state) => state.loginUser?.menu_permissions ?? [])
  )
  const { data: badges } = useQuery({
    queryKey: ['menuBadges'],
    queryFn: fetchMenuBadges,
    refetchInterval: 10_000,
  })

  const menuData = useSidebarMenu(routes, menuPermissions, { isLogin, badges })

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <RoleSwitcher roles={roles} />
      </SidebarHeader>
      <SidebarContent>
        {menuData.map((props) => (
          <MenuGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

import routes from '@/routes'
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

  const loginUser = useLoginUserStore((state) => state.loginUser)
  const menuPermissions = loginUser?.menuPermissions ?? []

  const menuData = useSidebarMenu(routes, menuPermissions, { isLogin: !!loginUser })

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
        <SidebarUser
          user={{ name: '123', email: 'ddd', avatar: 'https://github.com/shadcn.png' }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

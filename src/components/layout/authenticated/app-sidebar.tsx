import routes from '@/routes'
import { useSystemConfigStore } from '@/store/system'
import { useShallow } from 'zustand/react/shallow'

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

  const menuData = useSidebarMenu(routes, [], { isLogin: true }) // FIXME: isLogin

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

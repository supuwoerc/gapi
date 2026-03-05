import { useSystemConfigStore } from '@/store/system'
import { useShallow } from 'zustand/react/shallow'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import { roles } from './data/constant'
import RoleSwitcher from './role-switcher'

// import { AppTitle } from './app-title'
// import { sidebarData } from './data/sidebar-data'
// import { NavGroup } from './nav-group'
// import { NavUser } from './nav-user'

// import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const [collapsible, variant] = useSystemConfigStore(
    useShallow((state) => {
      return [state.collapsible, state.variant]
    })
  )

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <RoleSwitcher roles={roles} />
      </SidebarHeader>
      <SidebarContent>12312321321321</SidebarContent>
      <SidebarFooter>user</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

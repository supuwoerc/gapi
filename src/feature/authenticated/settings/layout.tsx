import { Bell, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { Separator } from '@/components/ui/separator'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  { title: 'nav.profile', href: '/settings', icon: <User size={18} /> },
  {
    title: 'nav.notifications',
    href: '/settings/notifications',
    icon: <Bell size={18} />,
  },
]

const SettingsLayout = () => {
  const { t } = useTranslation('settings')

  return (
    <>
      <AppHeader fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeModeSwitcher />
          <LanguageSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <AppMain>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Separator className="my-4 lg:my-6" />
        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          <aside className="top-0 lg:sticky lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex w-full overflow-y-hidden p-1">
            <Outlet />
          </div>
        </div>
      </AppMain>
    </>
  )
}

export default SettingsLayout

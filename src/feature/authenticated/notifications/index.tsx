import { useTranslation } from 'react-i18next'

import { useScrollRestoration } from '@/hooks/use-scroll-restoration'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { NotificationsTable } from './components/notifications-table'

const Notifications = () => {
  const { t } = useTranslation('feature')
  useScrollRestoration()

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
      <AppMain className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('notifications.title')}</h2>
            <p className="text-muted-foreground">{t('notifications.description')}</p>
          </div>
        </div>
        <NotificationsTable />
      </AppMain>
    </>
  )
}

export default Notifications

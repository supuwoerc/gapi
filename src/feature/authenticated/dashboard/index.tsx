import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import TopMenu from '@/components/layout/authenticated/components/top-menu'
import { topMenu } from '@/components/layout/authenticated/data/constant'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

const Forbidden = () => {
  const { t } = useTranslation()
  return (
    <>
      <AppHeader>
        <TopMenu links={topMenu} />
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeModeSwitcher />
          <LanguageSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <AppMain>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button size="default">{t('global.button.reload')}</Button>
          </div>
        </div>
        <Tabs orientation="horizontal" defaultValue="overview" className="space-y-4">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            123
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            456
          </TabsContent>
        </Tabs>
      </AppMain>
    </>
  )
}

export default Forbidden

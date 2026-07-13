import * as React from 'react'

import { ArrowUp, Bot, ClipboardList, FileText, Folder } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useActiveProjectStore } from '@/store/active-project'
import { useLoginUserStore } from '@/store/login-user'

import { useTour } from '@/hooks/tour/use-tour'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Stat, StatIndicator, StatLabel, StatTrend, StatValue } from '@/components/ui/stat'
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

import { ProjectAnalytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentActivity } from './components/recent-sales'

const EmptyMenuPermissions: string[] = []

type DashboardTab = 'overview' | 'project'

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'global'])
  const activeProject = useActiveProjectStore((state) => state.activeProject)
  const menuPermissions = useLoginUserStore(
    (state) => state.loginUser?.menu_permissions ?? EmptyMenuPermissions
  )
  const [tab, setTab] = React.useState<DashboardTab>('overview')

  useTour()
  const selectedTab = activeProject || tab !== 'project' ? tab : 'overview'
  const visibleTopMenu = React.useMemo(
    () => topMenu.filter((item) => menuPermissions.includes(item.permissionKey)),
    [menuPermissions]
  )

  const handleTabChange = (value: string) => {
    if (value === 'project' && !activeProject) return
    setTab(value as DashboardTab)
  }

  return (
    <>
      <AppHeader fixed>
        <TopMenu links={visibleTopMenu} />
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
          <h1 className="text-2xl font-bold tracking-tight">{t('name')}</h1>
          <div className="flex items-center space-x-2">
            <Button size="default">{t('global:button.reload')}</Button>
          </div>
        </div>
        <Tabs
          orientation="horizontal"
          value={selectedTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
              <TabsTrigger
                value="project"
                disabled={!activeProject}
                title={!activeProject ? t('tabs.projectDisabled') : undefined}
              >
                {t('tabs.project')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat>
                <StatLabel>{t('overview.stats.projects.label')}</StatLabel>
                <StatIndicator variant="icon" color="success">
                  <Folder />
                </StatIndicator>
                <StatValue>{t('overview.stats.projects.value')}</StatValue>
                <StatTrend trend="up">
                  <ArrowUp />
                  {t('overview.stats.projects.trend')}
                </StatTrend>
              </Stat>
              <Stat>
                <StatLabel>{t('overview.stats.tasks.label')}</StatLabel>
                <StatIndicator variant="icon" color="info">
                  <ClipboardList />
                </StatIndicator>
                <StatValue>{t('overview.stats.tasks.value')}</StatValue>
                <StatTrend trend="up">
                  <ArrowUp />
                  {t('overview.stats.tasks.trend')}
                </StatTrend>
              </Stat>
              <Stat>
                <StatLabel>{t('overview.stats.aiEmployees.label')}</StatLabel>
                <StatIndicator variant="icon" color="warning">
                  <Bot />
                </StatIndicator>
                <StatValue>{t('overview.stats.aiEmployees.value')}</StatValue>
                <StatTrend trend="up">
                  <ArrowUp />
                  {t('overview.stats.aiEmployees.trend')}
                </StatTrend>
              </Stat>
              <Stat>
                <StatLabel>{t('overview.stats.documents.label')}</StatLabel>
                <StatIndicator variant="icon" color="default">
                  <FileText />
                </StatIndicator>
                <StatValue>{t('overview.stats.documents.value')}</StatValue>
                <StatTrend trend="up">
                  <ArrowUp />
                  {t('overview.stats.documents.trend')}
                </StatTrend>
              </Stat>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>{t('overview.chart.title')}</CardTitle>
                  <CardDescription>{t('overview.chart.description')}</CardDescription>
                </CardHeader>
                <CardContent className="ps-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>{t('overview.activity.title')}</CardTitle>
                  <CardDescription>{t('overview.activity.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="project" className="space-y-4">
            {activeProject ? <ProjectAnalytics projectName={activeProject.name} /> : null}
          </TabsContent>
        </Tabs>
      </AppMain>
    </>
  )
}

export default Dashboard

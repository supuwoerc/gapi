import { ArrowDown, ArrowUp, DollarSign, MoreHorizontal, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

const Forbidden = () => {
  const { t } = useTranslation(['feature', 'global'])
  return (
    <>
      <AppHeader fixed>
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
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.name')}</h1>
          <div className="flex items-center space-x-2">
            <Button size="default">{t('global:button.reload')}</Button>
          </div>
        </div>
        <Tabs orientation="horizontal" defaultValue="overview" className="space-y-4">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">{t('dashboard.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('dashboard.tabs.analytics')}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat>
                <StatLabel>Total Revenue</StatLabel>
                <StatIndicator variant="icon" color="success">
                  <DollarSign />
                </StatIndicator>
                <StatValue>$45,231</StatValue>
                <StatTrend trend="up">
                  <ArrowUp />
                  +20.1% from last month
                </StatTrend>
              </Stat>
              <Stat>
                <StatLabel>Active Users</StatLabel>
                <StatIndicator variant="badge" color="info">
                  +24
                </StatIndicator>
                <StatValue>2,350</StatValue>
                <StatTrend trend="up">
                  <ArrowUp />
                  +180 from last week
                </StatTrend>
              </Stat>
              <Stat>
                <StatLabel>Total Orders</StatLabel>
                <StatIndicator variant="icon" color="warning">
                  <ShoppingCart />
                </StatIndicator>
                <StatValue>1,234</StatValue>
                <StatTrend trend="down">
                  <ArrowDown />
                  -4.3% from last month
                </StatTrend>
              </Stat>
              <Stat>
                <StatLabel>Conversion Rate</StatLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <StatIndicator variant="action">
                      <MoreHorizontal />
                    </StatIndicator>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Export data</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <StatValue>3.2%</StatValue>
                <StatTrend trend="neutral">No change from last week</StatTrend>
              </Stat>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="ps-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>You made 265 sales this month.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>
        </Tabs>
      </AppMain>
    </>
  )
}

export default Forbidden

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

const Users = () => {
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
            <h2 className="text-2xl font-bold tracking-tight">User List</h2>
            <p className="text-muted-foreground">Manage your users and their permissions here.</p>
          </div>
        </div>
        TODO
      </AppMain>
    </>
  )
}

export default Users

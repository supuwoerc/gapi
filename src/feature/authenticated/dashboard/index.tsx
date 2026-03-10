import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import TopMenu from '@/components/layout/authenticated/components/top-menu'
import { topMenu } from '@/components/layout/authenticated/data/constant'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

const Forbidden = () => {
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
      <div>{123}</div>
    </>
  )
}

export default Forbidden

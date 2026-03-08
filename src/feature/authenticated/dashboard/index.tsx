import { ConfigDrawer } from '@/components/config-drawer'
import AppHeader from '@/components/layout/authenticated/app-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

const Forbidden = () => {
  return (
    <>
      <AppHeader>
        <Search />{' '}
        <div className="ms-auto flex items-center space-x-4">
          <ThemeModeSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <div>{123}</div>
    </>
  )
}

export default Forbidden

import type { FC } from 'react'

import { useOutlet } from 'react-router'

import { cn } from '@/lib/utils'

import { LanguageSwitcher } from '../language-switcher'
import { Logo } from '../logo'
import { NavigationProgress } from '../navigation-progress'
import { ThemeModeSwitcher } from '../theme-mode-switcher'
import { ThemeSwitcher } from '../theme-switcher'

interface FullscreenLayoutProps {
  pure?: boolean
  logo?: boolean
  setting?: boolean
}

const FullscreenLayout: FC<FullscreenLayoutProps> = ({
  pure = false,
  logo = true,
  setting = true,
}) => {
  const currentOutlet = useOutlet()
  return (
    <>
      <NavigationProgress />
      <main className={cn('relative h-svh w-svw overflow-x-hidden pt-20', pure && 'pt-0')}>
        {logo && <Logo className="fixed top-5 left-5" />}
        {setting && (
          <div className="fixed top-5 right-5 z-99 flex gap-2 max-[320px]:hidden">
            <LanguageSwitcher />
            <ThemeModeSwitcher />
            <ThemeSwitcher />
          </div>
        )}
        <main>
          <div>{currentOutlet}</div>
        </main>
      </main>
    </>
  )
}

export default FullscreenLayout

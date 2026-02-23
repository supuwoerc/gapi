import type { FC } from 'react'

import { useOutlet } from 'react-router'

import { cn } from '@/lib/utils'

import { LanguageSwitcher } from '../language-switcher'
import { Logo } from '../logo'
import { NavigationProgress } from '../navigation-progress'
import { ThemeModeSwitcher } from '../theme-mode-switcher'

interface FullscreenLayoutProps {
  pure?: boolean
}

const FullscreenLayout: FC<FullscreenLayoutProps> = ({ pure = false }) => {
  const currentOutlet = useOutlet()
  return (
    <>
      <NavigationProgress />
      <main className={cn('relative h-svh w-svw overflow-x-hidden pt-20', pure && 'pt-0')}>
        <Logo className="fixed top-5 left-5" />
        <div className="fixed top-5 right-5 flex gap-2">
          <LanguageSwitcher />
          <ThemeModeSwitcher />
        </div>
        <main>
          <div>{currentOutlet}</div>
        </main>
      </main>
    </>
  )
}

export default FullscreenLayout

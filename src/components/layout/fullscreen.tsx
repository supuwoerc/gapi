import type { FC } from 'react'

import { useOutlet } from 'react-router'

import { LanguageSwitcher } from '../language-switcher'
import { Logo } from '../logo'
import { NavigationProgress } from '../navigation-progress'

interface FullscreenLayoutProps {
  pure?: boolean
}

const FullscreenLayout: FC<FullscreenLayoutProps> = () => {
  const currentOutlet = useOutlet()
  return (
    <>
      <NavigationProgress />
      <main className="relative h-svh w-svw overflow-x-hidden pt-20">
        <Logo className="fixed top-5 left-5" />
        <div className="fixed top-5 right-5 flex gap-2">
          <LanguageSwitcher />
        </div>
        <main>
          <div>{currentOutlet}</div>
        </main>
      </main>
    </>
  )
}

export default FullscreenLayout

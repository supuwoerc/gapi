import { type FC, useRef } from 'react'

import { useOutlet } from 'react-router'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { cn } from '@/lib/utils'

import { LanguageSwitcher } from '../language-switcher'
import { Logo } from '../logo'
import { NavigationProgress } from '../navigation-progress'
import { NavigationTitle } from '../navigation-title'
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
  const nodeRef = useRef<HTMLDivElement | null>(null)
  return (
    <>
      <NavigationProgress />
      <NavigationTitle />
      <main className={cn('relative h-svh w-svw overflow-x-hidden pt-20', pure && 'pt-0')}>
        {logo && <Logo className="fixed top-5 left-5" to="/" />}
        {setting && (
          <div className="fixed top-5 right-5 z-99 flex gap-2 max-[320px]:hidden">
            <LanguageSwitcher accent />
            <ThemeModeSwitcher accent />
            <ThemeSwitcher accent />
          </div>
        )}
        <main className="h-full w-full">
          <SwitchTransition>
            <CSSTransition
              key={location.pathname}
              nodeRef={nodeRef}
              timeout={500}
              mountOnEnter
              unmountOnExit
              exit={false}
              classNames="fade-slide"
            >
              {() => (
                <div ref={nodeRef} className="h-full w-full">
                  {currentOutlet}
                </div>
              )}
            </CSSTransition>
          </SwitchTransition>
        </main>
      </main>
    </>
  )
}

export default FullscreenLayout

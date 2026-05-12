import { type FC, type PropsWithChildren, useRef } from 'react'

import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { useOutlet } from 'react-router'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { useShallow } from 'zustand/react/shallow'

import { setSidebarOpen, useSystemConfigStore } from '@/store/system-config'

import { cn } from '@/lib/utils'

import { SearchProvider } from '@/context/search-provider'

import { useTransitionKey } from '@/hooks/use-transition-key'

import { NavigationProgress } from '../navigation-progress'
import { NavigationTitle } from '../navigation-title'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from './authenticated/app-sidebar'

const AuthenticedLayout: FC<PropsWithChildren> = ({ children }) => {
  const currentOutlet = useOutlet()
  const transitionKey = useTransitionKey()
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const [sidebarOpen] = useSystemConfigStore(
    useShallow((state) => {
      return [state.sidebar.open]
    })
  )

  return (
    <NuqsAdapter>
      <NavigationProgress />
      <NavigationTitle />
      <SearchProvider>
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <SwitchTransition>
              <CSSTransition
                key={transitionKey}
                nodeRef={nodeRef}
                timeout={500}
                mountOnEnter
                unmountOnExit
                exit={false}
                classNames="fade-slide"
              >
                {() => (
                  <div ref={nodeRef} className="flex w-full flex-1 flex-col">
                    {children ?? currentOutlet}
                  </div>
                )}
              </CSSTransition>
            </SwitchTransition>
          </SidebarInset>
        </SidebarProvider>
      </SearchProvider>
    </NuqsAdapter>
  )
}

export default AuthenticedLayout

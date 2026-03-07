import { type FC, type PropsWithChildren, useRef } from 'react'

import { setSidebarOpen, useSystemConfigStore } from '@/store/system'
import { useOutlet } from 'react-router'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'

import { SearchProvider } from '@/context/search-provider'

import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from './authenticated/app-sidebar'

const AuthenticedLayout: FC<PropsWithChildren> = ({ children }) => {
  const currentOutlet = useOutlet()
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const [sidebarOpen] = useSystemConfigStore(
    useShallow((state) => {
      return [state.sidebarOpen]
    })
  )

  return (
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
              key={location.pathname}
              nodeRef={nodeRef}
              timeout={500}
              mountOnEnter
              unmountOnExit
              exit={false}
              classNames="fade-slide"
            >
              {() => <div ref={nodeRef}>{children ?? currentOutlet}</div>}
            </CSSTransition>
          </SwitchTransition>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  )
}

export default AuthenticedLayout

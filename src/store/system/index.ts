import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { Theme } from '@/types/theme'

type TSystemConfigStore = {
  sidebarCollapsed: boolean
  theme: Theme
}

const initialSystemConfig: TSystemConfigStore = {
  sidebarCollapsed: false,
  theme: 'system',
}

const SYSTEM_CONFIG_STORE_NAME = 'systemConfigStore'

export const useSystemConfigStore = create<TSystemConfigStore>()(
  immer(
    devtools(
      persist(() => initialSystemConfig, {
        name: SYSTEM_CONFIG_STORE_NAME,
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }),
      {
        name: SYSTEM_CONFIG_STORE_NAME,
      }
    )
  )
)

export const setSystemSidebarCollapsed = (sidebarCollapsed: boolean) => {
  useSystemConfigStore.setState((state) => {
    state.sidebarCollapsed = sidebarCollapsed
  })
}

export const setSystemTheme = (theme: TSystemConfigStore['theme']) => {
  useSystemConfigStore.setState((state) => {
    state.theme = theme
  })
}

import type { Theme, ThemeMode } from '@/schema/theme'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type TSystemConfigStore = {
  sidebarCollapsed: boolean
  themeMode: ThemeMode
  theme: Theme
}

const initialSystemConfig: TSystemConfigStore = {
  sidebarCollapsed: false,
  themeMode: 'system',
  theme: 'default',
}

const SYSTEM_CONFIG_STORE_NAME = 'systemConfigStore'

export const useSystemConfigStore = create<TSystemConfigStore>()(
  immer(
    devtools(
      persist(() => initialSystemConfig, {
        name: SYSTEM_CONFIG_STORE_NAME,
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          themeMode: state.themeMode,
          theme: state.theme,
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

export const setSystemThemeMode = (theme: TSystemConfigStore['themeMode']) => {
  useSystemConfigStore.setState((state) => {
    state.themeMode = theme
  })
}

export const setSystemTheme = (theme: TSystemConfigStore['theme']) => {
  useSystemConfigStore.setState((state) => {
    state.theme = theme
  })
}

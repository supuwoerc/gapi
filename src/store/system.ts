import type { Language } from '@/schema/language'
import type { Theme, ThemeMode } from '@/schema/theme'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type TSystemConfigStore = {
  themeMode: ThemeMode
  theme: Theme
  language: Language
  sidebarOpen: boolean
  collapsible: 'offcanvas' | 'icon' | 'none'
  variant: 'sidebar' | 'floating' | 'inset'
}

const initialSystemConfig: TSystemConfigStore = {
  themeMode: 'light',
  theme: 'green',
  language: 'zh',
  sidebarOpen: true,
  collapsible: 'icon',
  variant: 'inset',
}

const SYSTEM_CONFIG_STORE_NAME = 'systemConfigStore'

export const useSystemConfigStore = create<TSystemConfigStore>()(
  immer(
    devtools(
      persist(() => initialSystemConfig, {
        name: SYSTEM_CONFIG_STORE_NAME,
        partialize: (state) => ({
          themeMode: state.themeMode,
          theme: state.theme,
          language: state.language,
          sidebarOpen: state.sidebarOpen,
          collapsible: state.collapsible,
          variant: state.variant,
        }),
      }),
      {
        name: SYSTEM_CONFIG_STORE_NAME,
      }
    )
  )
)

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

export const setSystemLanguage = (language: TSystemConfigStore['language']) => {
  useSystemConfigStore.setState((state) => {
    state.language = language
  })
}

export const setSidebarOpen = (sidebarOpen: TSystemConfigStore['sidebarOpen']) => {
  useSystemConfigStore.setState((state) => {
    state.sidebarOpen = sidebarOpen
  })
}

export const setSidebarCollapsible = (collapsible: TSystemConfigStore['collapsible']) => {
  useSystemConfigStore.setState((state) => {
    state.collapsible = collapsible
  })
}

export const setSidebarVariant = (variant: TSystemConfigStore['variant']) => {
  useSystemConfigStore.setState((state) => {
    state.variant = variant
  })
}

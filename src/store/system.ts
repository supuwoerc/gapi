import type { Language } from '@/schema/language'
import type { Theme, ThemeMode } from '@/schema/theme'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { defaultTheme, defaultThemeMode } from '@/context/theme-provider'

export type TSystemConfigStore = {
  themeMode: ThemeMode
  theme: Theme
  language: Language
  sidebar: {
    open: boolean
    collapsible: 'offcanvas' | 'icon' | 'none'
    variant: 'sidebar' | 'floating' | 'inset'
  }
}

export const defaultVariant = 'inset'

export const defaultCollapsible = 'icon'

const initialSystemConfig: TSystemConfigStore = {
  themeMode: defaultThemeMode,
  theme: defaultTheme,
  language: 'zh',
  sidebar: {
    open: true,
    collapsible: defaultCollapsible,
    variant: defaultVariant,
  },
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
          sidebar: state.sidebar,
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

export const setSidebarOpen = (open: TSystemConfigStore['sidebar']['open']) => {
  useSystemConfigStore.setState((state) => {
    state.sidebar.open = open
  })
}

export const setSidebarCollapsible = (
  collapsible: TSystemConfigStore['sidebar']['collapsible']
) => {
  useSystemConfigStore.setState((state) => {
    state.sidebar.collapsible = collapsible
  })
}

export const setSidebarVariant = (variant: TSystemConfigStore['sidebar']['variant']) => {
  useSystemConfigStore.setState((state) => {
    state.sidebar.variant = variant
  })
}

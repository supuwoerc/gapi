import { type FC, type PropsWithChildren, createContext, useEffect } from 'react'

import { setSystemTheme, setSystemThemeMode, useSystemConfigStore } from '@/store/system'
import type { Theme, ThemeMode } from '@/types/theme'
import { useShallow } from 'zustand/react/shallow'

export type ThemeProviderState = {
  themeMode: ThemeMode
  theme: Theme
  setThemeMode: (mode: ThemeMode) => void
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  themeMode: 'system',
  theme: 'default',
  setThemeMode: () => null,
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const ThemeProvider: FC<PropsWithChildren> = ({ children, ...props }) => {
  const { themeMode, theme } = useSystemConfigStore(
    useShallow((state) => ({
      themeMode: state.themeMode,
      theme: state.theme,
    }))
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (themeMode === 'system') {
      const matches = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemTheme = matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(themeMode)
  }, [themeMode])

  useEffect(() => {
    const root = window.document.documentElement
    root.dataset.theme = theme
  }, [theme])

  const value: ThemeProviderState = {
    themeMode,
    theme,
    setThemeMode: (mode: ThemeMode) => setSystemThemeMode(mode),
    setTheme: (t: Theme) => setSystemTheme(t),
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export { ThemeProvider, ThemeProviderContext }

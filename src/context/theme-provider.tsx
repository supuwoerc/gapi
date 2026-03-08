import { type FC, type PropsWithChildren, createContext, useEffect } from 'react'

import type { Theme, ThemeMode } from '@/schema/theme'
import { setSystemTheme, setSystemThemeMode, useSystemConfigStore } from '@/store/system'
import { useShallow } from 'zustand/react/shallow'

type ThemeProviderState = {
  themeMode: ThemeMode
  theme: Theme
  defaultThemeMode: ThemeMode
  defaultTheme: Theme
  setThemeMode: (mode: ThemeMode) => void
  setTheme: (theme: Theme) => void
  reset: () => void
}

export const defaultThemeMode: ThemeMode = 'system'

export const defaultTheme: Theme = 'green'

const initialState: ThemeProviderState = {
  themeMode: defaultThemeMode,
  theme: defaultTheme,
  defaultThemeMode: defaultThemeMode,
  defaultTheme: defaultTheme,
  setThemeMode: () => null,
  setTheme: () => null,
  reset: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const ThemeProvider: FC<PropsWithChildren> = ({ children, ...props }) => {
  const [themeMode, theme] = useSystemConfigStore(
    useShallow((state) => [state.themeMode, state.theme])
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
    defaultThemeMode,
    defaultTheme,
    setThemeMode: (mode: ThemeMode) => setSystemThemeMode(mode),
    setTheme: (t: Theme) => setSystemTheme(t),
    reset: () => {
      setSystemThemeMode(defaultThemeMode)
      setSystemTheme(defaultTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export { ThemeProvider, ThemeProviderContext }

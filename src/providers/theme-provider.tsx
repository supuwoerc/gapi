import { type FC, type PropsWithChildren, createContext, useEffect } from 'react'

import { setSystemTheme, useSystemConfigStore } from '@/store/system'
import type { Theme } from '@/types/theme'

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const ThemeProvider: FC<PropsWithChildren> = ({ children, ...props }) => {
  const theme = useSystemConfigStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const matches = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemTheme = matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => setSystemTheme(theme),
  }
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export { ThemeProvider, ThemeProviderContext }

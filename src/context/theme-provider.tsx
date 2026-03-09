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
  resetTheme: () => void
  resetThemeMode: () => void
}

export const defaultThemeMode: ThemeMode = 'system'

export const defaultTheme: Theme = 'default'

export const themeOptions: Array<{ key: Theme; fillStroke: string; localeKey: string }> = [
  {
    key: 'default',
    fillStroke: 'fill-[oklch(0.205_0_0)] stroke-[oklch(0.205_0_0)]',
    localeKey: 'common.system.theme.default',
  },
  {
    key: 'green',
    fillStroke: 'fill-[oklch(0.648_0.2_131.684)] stroke-[oklch(0.648_0.2_131.684)]',
    localeKey: 'common.system.theme.green',
  },
  {
    key: 'orange',
    fillStroke: 'fill-[oklch(0.646_0.222_41.116)] stroke-[oklch(0.646_0.222_41.116)]',
    localeKey: 'common.system.theme.orange',
  },
  {
    key: 'red',
    fillStroke: 'fill-[oklch(0.577_0.245_27.325)] stroke-[oklch(0.577_0.245_27.325)]',
    localeKey: 'common.system.theme.red',
  },
  {
    key: 'rose',
    fillStroke: 'fill-[oklch(0.586_0.253_17.585)] stroke-[oklch(0.586_0.253_17.585)]',
    localeKey: 'common.system.theme.rose',
  },
  {
    key: 'violet',
    fillStroke: 'fill-[oklch(0.541_0.281_293.009)] stroke-[oklch(0.541_0.281_293.009)]',
    localeKey: 'common.system.theme.violet',
  },
  {
    key: 'yellow',
    fillStroke: 'fill-[oklch(0.852_0.199_91.936)] stroke-[oklch(0.852_0.199_91.936)]',
    localeKey: 'common.system.theme.yellow',
  },
  {
    key: 'blue',
    fillStroke: 'fill-[oklch(0.488_0.243_264.376)] stroke-[oklch(0.488_0.243_264.376)]',
    localeKey: 'common.system.theme.blue',
  },
]

const initialState: ThemeProviderState = {
  themeMode: defaultThemeMode,
  theme: defaultTheme,
  defaultThemeMode: defaultThemeMode,
  defaultTheme: defaultTheme,
  setThemeMode: () => null,
  setTheme: () => null,
  resetTheme: () => null,
  resetThemeMode: () => null,
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
    resetTheme: () => {
      setSystemTheme(defaultTheme)
    },
    resetThemeMode: () => {
      setSystemThemeMode(defaultThemeMode)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export { ThemeProvider, ThemeProviderContext }

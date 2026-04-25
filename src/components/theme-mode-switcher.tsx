import type { FC } from 'react'

import type { ThemeMode } from '@/schema/theme'
import { Check, Moon, Sun, SunMoon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { setSystemThemeMode, useSystemConfigStore } from '@/store/system-config'

import { cn } from '@/lib/utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface ThemeModeSwitcherProps {
  className?: string
  accent?: boolean
}

const options: Array<{ key: ThemeMode; localeKey: string }> = [
  {
    key: 'system',
    localeKey: 'component:configDrawer.themeMode.system',
  },
  {
    key: 'light',
    localeKey: 'component:configDrawer.themeMode.light',
  },
  {
    key: 'dark',
    localeKey: 'component:configDrawer.themeMode.dark',
  },
]

const ThemeModeSwitcher: FC<ThemeModeSwitcherProps> = ({ className, accent }) => {
  const [themeMode] = useSystemConfigStore(
    useShallow((state) => {
      return [state.themeMode, state.language]
    })
  )

  const { t } = useTranslation('component')

  const changeThemeModeHandle = (mode: ThemeMode, localKey: string) => {
    if (mode !== themeMode) {
      setSystemThemeMode(mode)
      toast.success(t('themeModeSwitcher.tips', { mode: t(localKey as never) }))
    }
  }

  return (
    <div className={cn('cursor-pointer', className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-[50%] text-accent-foreground hover:bg-accent dark:hover:bg-accent/50',
              accent && 'bg-accent dark:bg-accent/50'
            )}
          >
            {themeMode == 'system' && <SunMoon size={16} />}
            {themeMode == 'light' && <Sun size={16} />}
            {themeMode == 'dark' && <Moon size={16} />}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {options.map(({ key, localeKey }) => {
            return (
              <DropdownMenuItem
                key={key}
                className="cursor-pointer"
                onClick={() => changeThemeModeHandle(key, localeKey)}
              >
                {t(localeKey as never)}
                <Check size={14} className={cn('ms-auto', themeMode !== key && 'hidden')} />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export { ThemeModeSwitcher }

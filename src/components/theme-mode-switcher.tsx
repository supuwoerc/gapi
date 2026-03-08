import type { FC } from 'react'

import type { ThemeMode } from '@/schema/theme'
import { setSystemThemeMode, useSystemConfigStore } from '@/store/system'
import { Check, Moon, Sun, SunMoon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

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
    localeKey: 'common.system.themeMode.system',
  },
  {
    key: 'light',
    localeKey: 'common.system.themeMode.light',
  },
  {
    key: 'dark',
    localeKey: 'common.system.themeMode.dark',
  },
]

const ThemeModeSwitcher: FC<ThemeModeSwitcherProps> = ({ className, accent }) => {
  const [themeMode, language] = useSystemConfigStore(
    useShallow((state) => {
      return [state.themeMode, state.language]
    })
  )

  const { t } = useTranslation()

  const changeThemeModeHandle = (mode: ThemeMode, localKey: string) => {
    if (mode !== themeMode) {
      setSystemThemeMode(mode)
      toast.success(language == 'en' ? `Switch to ${t(localKey)} mode` : `切换为${t(localKey)}模式`)
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
                {t(localeKey)}
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

import type { FC } from 'react'

import type { Theme } from '@/schema/theme'
import { Check, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { setSystemTheme, useSystemConfigStore } from '@/store/system'

import { cn } from '@/lib/utils'

import { themeOptions } from '@/context/theme-provider'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface ThemeSwitcherProps {
  className?: string
  accent?: boolean
}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ className, accent }) => {
  const [theme] = useSystemConfigStore(
    useShallow((state) => {
      return [state.theme, state.language]
    })
  )

  const { t } = useTranslation('component')

  const changeThemeHandle = (mode: Theme, localKey: string) => {
    if (mode !== theme) {
      setSystemTheme(mode)
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
            <Palette size={16} />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {themeOptions.map(({ key, localeKey }) => {
            return (
              <DropdownMenuItem
                key={key}
                className="cursor-pointer"
                onClick={() => changeThemeHandle(key, localeKey)}
              >
                {t(localeKey as never)}
                <Check size={14} className={cn('ms-auto', theme !== key && 'hidden')} />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export { ThemeSwitcher }

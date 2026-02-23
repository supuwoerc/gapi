import type { CSSProperties, FC } from 'react'

import type { Theme } from '@/schema/theme'
import { setSystemTheme, useSystemConfigStore } from '@/store/system'
import { Check, Palette } from 'lucide-react'
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

interface ThemeSwitcherProps {
  style?: CSSProperties
  className?: string
}

const options: Array<{ key: Theme; localeKey: string }> = [
  {
    key: 'default',
    localeKey: 'common.system.theme.default',
  },
  {
    key: 'cyberpunk',
    localeKey: 'common.system.theme.cyberpunk',
  },
  {
    key: 'green',
    localeKey: 'common.system.theme.green',
  },
  {
    key: 'kupikod',
    localeKey: 'common.system.theme.kupikod',
  },
  {
    key: 'orange',
    localeKey: 'common.system.theme.orange',
  },
  {
    key: 'red',
    localeKey: 'common.system.theme.red',
  },
  {
    key: 'rose',
    localeKey: 'common.system.theme.rose',
  },
  {
    key: 'violet',
    localeKey: 'common.system.theme.violet',
  },
  {
    key: 'yellow',
    localeKey: 'common.system.theme.yellow',
  },
  {
    key: 'blue',
    localeKey: 'common.system.theme.blue',
  },
]

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ style, className }) => {
  const [theme, language] = useSystemConfigStore(
    useShallow((state) => {
      return [state.theme, state.language]
    })
  )

  const { t } = useTranslation()

  const changeThemeModeHandle = (mode: Theme, localKey: string) => {
    if (mode !== theme) {
      setSystemTheme(mode)
      toast.info(language == 'en' ? `Switch to ${t(localKey)} mode` : `切换为${t(localKey)}模式`)
    }
  }

  return (
    <div style={style} className={cn('cursor-pointer', className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="flex h-9 w-9 items-center justify-center rounded-[50%] bg-accent text-accent-foreground dark:bg-accent/50">
            <Palette size={16} />
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

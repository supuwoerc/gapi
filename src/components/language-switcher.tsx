import type { CSSProperties, FC } from 'react'

import type { Language } from '@/schema/language'
import { useSystemConfigStore } from '@/store/system'
import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface LanguageSwitcherProps {
  style?: CSSProperties
  className?: string
}

const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ style, className }) => {
  const { i18n } = useTranslation()
  const language = useSystemConfigStore((state) => state.language)

  const changeLanguage = (lng: Language) => {
    if (lng !== language) {
      i18n.changeLanguage(lng)
      toast.info(lng == 'en' ? 'Switch language to English' : '切换语言为中文简体')
    }
  }

  return (
    <div style={style} className={cn('cursor-pointer', className)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="flex h-9 w-9 items-center justify-center rounded-[50%] bg-accent text-accent-foreground dark:bg-accent/50">
            <Languages size={16} />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => changeLanguage('zh')}>
            中文 <Check size={14} className={cn('ms-auto', language !== 'zh' && 'hidden')} />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => changeLanguage('en')}>
            English
            <Check size={14} className={cn('ms-auto', language !== 'en' && 'hidden')} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export { LanguageSwitcher }

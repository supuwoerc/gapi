import type { FC } from 'react'

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
  accent?: boolean
  className?: string
}

const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ accent, className }) => {
  const { i18n } = useTranslation()
  const language = useSystemConfigStore((state) => state.language)

  const changeLanguageHandle = (lng: Language) => {
    if (lng !== language) {
      i18n.changeLanguage(lng)
      toast.success(lng == 'en' ? 'Switch language to English' : '切换语言为简体中文')
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
            <Languages size={16} />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => changeLanguageHandle('zh')}>
            中文 <Check size={14} className={cn('ms-auto', language !== 'zh' && 'hidden')} />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => changeLanguageHandle('en')}>
            English
            <Check size={14} className={cn('ms-auto', language !== 'en' && 'hidden')} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export { LanguageSwitcher }

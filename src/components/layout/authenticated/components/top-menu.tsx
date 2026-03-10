import type { FC } from 'react'

import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopMenuProps {
  links: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }[]
  className?: string
}

const TopMenu: FC<TopMenuProps> = ({ links, className }) => {
  const { t } = useTranslation()
  return (
    <>
      <div className="lg:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="md:size-7">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            {links.map(({ title, href, isActive, disabled }) => (
              <DropdownMenuItem key={`${title}-${href}`} asChild>
                <Link
                  to={href}
                  className={cn(
                    !isActive ? 'text-muted-foreground' : '',
                    disabled ? 'pointer-events-none' : ''
                  )}
                >
                  {t(title)}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn('hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6', className)}
      >
        {links.map(({ title, href, isActive, disabled }) => (
          <Link
            key={`${title}-${href}`}
            to={href}
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'} ${disabled ? 'pointer-events-none' : ''}`}
          >
            {t(title)}
          </Link>
        ))}
      </nav>
    </>
  )
}

export default TopMenu

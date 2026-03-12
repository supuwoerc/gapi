import type { FC, PropsWithChildren } from 'react'

import type { CollapsibleMenu, LinkMenu, Menu, MenuItem } from '@/schema/menu'
import { ChevronRight } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic.mjs'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigation } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'

const MenuGroup: FC<Menu> = ({ title, items }) => {
  const { state, isMobile } = useSidebar()
  const { t } = useTranslation()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(title)}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items) {
            return <SidebarMenuLink key={key} item={item} />
          }

          if (state === 'collapsed' && !isMobile) {
            return <SidebarMenuCollapsedDropdown key={key} item={item} />
          }

          return <SidebarMenuCollapsible key={key} item={item} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const MenuBadge: FC<PropsWithChildren> = ({ children }) => {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
}

const SidebarMenuLink: FC<{ item: LinkMenu }> = ({ item }) => {
  const { setOpenMobile } = useSidebar()
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { state, location } = useNavigation()
  const isLoading = state === 'loading' && location?.pathname === item.url
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={checkIsActive(pathname, item)} tooltip={t(item.title)}>
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <DynamicIcon name={item.icon} />}
          <span>{t(item.title)}</span>
          {item.badge && <MenuBadge>{item.badge}</MenuBadge>}
          {isLoading && <Spinner />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const SidebarMenuCollapsible: FC<{ item: CollapsibleMenu }> = ({ item }) => {
  const { setOpenMobile } = useSidebar()
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { state, location } = useNavigation()
  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(pathname, item, true)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={t(item.title)}>
            {item.icon && <DynamicIcon name={item.icon} />}
            <span>{t(item.title)}</span>
            {item.badge && <MenuBadge>{item.badge}</MenuBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={normalize(pathname) === normalize(String(subItem.url))}
                >
                  <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                    {subItem.icon && <DynamicIcon name={subItem.icon} />}
                    <span>{t(subItem.title)}</span>
                    {subItem.badge && <MenuBadge>{subItem.badge}</MenuBadge>}
                    {state === 'loading' && location?.pathname === subItem.url && (
                      <Spinner className="absolute right-2" />
                    )}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const SidebarMenuCollapsedDropdown: FC<{ item: CollapsibleMenu }> = ({ item }) => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={t(item.title)} isActive={checkIsActive(pathname, item)}>
            {item.icon && <DynamicIcon name={item.icon} />}
            <span>{t(item.title)}</span>
            {item.badge && <MenuBadge>{item.badge}</MenuBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {t(item.title)} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                to={sub.url}
                className={
                  normalize(pathname) === normalize(String(sub.url))
                    ? 'cursor-pointer bg-secondary'
                    : 'cursor-pointer'
                }
              >
                {sub.icon && <DynamicIcon name={sub.icon} />}
                <span className="max-w-52 text-wrap">{t(sub.title)}</span>
                {sub.badge && <span className="ms-auto text-xs">{sub.badge}</span>}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: MenuItem, isMain = false): boolean {
  const pathname = normalize(href)
  const itemPath = 'url' in item && item.url ? normalize(String(item.url)) : ''
  if (pathname === itemPath) {
    return true
  }
  if ('items' in item && item.items?.some((child) => normalize(String(child.url)) === pathname)) {
    return true
  }
  if (isMain && itemPath) {
    return pathname.startsWith(itemPath + '/')
  }
  return false
}

function normalize(url: string): string {
  const clean = url.split('?')[0].split('#')[0]
  return clean.length > 1 && clean.endsWith('/') ? clean.slice(0, -1) : clean
}

export default MenuGroup

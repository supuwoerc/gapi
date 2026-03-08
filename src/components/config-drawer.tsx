import { type FC, type SVGProps } from 'react'

import { Item, Root as Radio } from '@radix-ui/react-radio-group'

import {
  type TSystemConfigStore,
  defaultCollapsible,
  defaultVariant,
  setSidebarCollapsible,
  setSidebarVariant,
  useSystemConfigStore,
} from '@/store/system'
import { CircleCheck, RotateCcw, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import IconLayoutCompact from '@/assets/config/layout-compact.svg?react'
import IconLayoutDefault from '@/assets/config/layout-default.svg?react'
import IconLayoutFull from '@/assets/config/layout-full.svg?react'
import IconSidebarFloating from '@/assets/config/sidebar-floating.svg?react'
import IconSidebarInset from '@/assets/config/sidebar-inset.svg?react'
import IconSidebarSide from '@/assets/config/sidebar-side.svg?react'
import IconThemeDark from '@/assets/config/theme-dark.svg?react'
import IconThemeSystem from '@/assets/config/theme-default.svg?react'
import IconThemeLight from '@/assets/config/theme-light.svg?react'

import { cn } from '@/lib/utils'

import { useTheme } from '@/hooks/use-theme'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { useSidebar } from './ui/sidebar'

export function ConfigDrawer() {
  const { reset } = useTheme()
  const { setOpen } = useSidebar()
  const { t } = useTranslation()

  const handleReset = () => {
    reset()
    setOpen(true)
    setSidebarVariant(defaultVariant)
    setSidebarCollapsible(defaultCollapsible)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Open theme settings"
          aria-describedby="config-drawer-description"
          className="rounded-full"
        >
          <Settings aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>{t('common.setting')}</SheetTitle>
          <SheetDescription id="config-drawer-description">
            {t('common.system.configTips') || 'desc'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <ThemeModeConfig />
          <SidebarConfig />
          <LayoutConfig />
        </div>
        <SheetFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={handleReset}
            aria-label="Reset all settings to default values"
          >
            {t('common.reset')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button size="icon" variant="secondary" className="size-4 rounded-full" onClick={onReset}>
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: FC<SVGProps<SVGSVGElement>>
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role="img"
        aria-hidden="false"
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden="true"
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 text-xs" id={`${item.value}-description`} aria-live="polite">
        {item.label}
      </div>
    </Item>
  )
}

function ThemeModeConfig() {
  const { defaultThemeMode, themeMode, setThemeMode } = useTheme()
  const { t } = useTranslation()

  return (
    <div>
      <SectionTitle
        title={t('common.system.themeMode.name')}
        showReset={themeMode !== defaultThemeMode}
        onReset={() => setThemeMode(defaultThemeMode)}
      />
      <Radio
        value={themeMode}
        onValueChange={setThemeMode}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select theme preference"
        aria-describedby="theme-description"
      >
        {[
          {
            value: 'system',
            label: t('common.system.themeMode.system'),
            icon: IconThemeSystem,
          },
          {
            value: 'light',
            label: t('common.system.themeMode.light'),
            icon: IconThemeLight,
          },
          {
            value: 'dark',
            label: t('common.system.themeMode.dark'),
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
    </div>
  )
}

function SidebarConfig() {
  const [variant] = useSystemConfigStore(
    useShallow((state) => {
      return [state.sidebar.variant]
    })
  )
  const { t } = useTranslation()

  return (
    <div className="max-md:hidden">
      <SectionTitle
        title={t('common.system.sidebar.name')}
        showReset={defaultVariant !== variant}
        onReset={() => setSidebarVariant(defaultVariant)}
      />
      <Radio
        value={variant}
        onValueChange={setSidebarVariant}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select sidebar style"
        aria-describedby="sidebar-description"
      >
        {[
          {
            value: 'inset',
            label: t('common.system.sidebar.inset'),
            icon: IconSidebarInset,
          },
          {
            value: 'floating',
            label: t('common.system.sidebar.floating'),
            icon: IconSidebarFloating,
          },
          {
            value: 'sidebar',
            label: t('common.system.sidebar.side'),
            icon: IconSidebarSide,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  )
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const [collapsible] = useSystemConfigStore(
    useShallow((state) => {
      return [state.sidebar.collapsible]
    })
  )

  const { t } = useTranslation()

  const radioState = open ? 'default' : collapsible

  return (
    <div className="max-md:hidden">
      <SectionTitle
        title={t('common.system.layout.name')}
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true)
          setSidebarCollapsible(defaultCollapsible)
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true)
            return
          }
          setOpen(false)
          setSidebarCollapsible(v as TSystemConfigStore['sidebar']['collapsible'])
        }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select layout style"
        aria-describedby="layout-description"
      >
        {[
          {
            value: 'default',
            label: t('common.system.layout.default'),
            icon: IconLayoutDefault,
          },
          {
            value: 'icon',
            label: t('common.system.layout.compact'),
            icon: IconLayoutCompact,
          },
          {
            value: 'offcanvas',
            label: t('common.system.layout.full'),
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  )
}

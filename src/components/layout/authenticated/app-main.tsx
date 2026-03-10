import { type FC, type PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

type AppMainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
  ref?: React.Ref<HTMLElement>
}

const AppMain: FC<PropsWithChildren<AppMainProps>> = ({ className, fixed, fluid, ...props }) => {
  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn(
        'px-4 py-6',
        fixed && 'flex grow flex-col overflow-hidden',
        !fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
        className
      )}
      {...props}
    />
  )
}

export default AppMain

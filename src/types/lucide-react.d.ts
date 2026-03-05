// https://github.com/lucide-icons/lucide/issues/2867
declare module 'lucide-react/dynamic.mjs' {
  import * as React from 'react'

  export interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
    name: string
  }

  export const DynamicIcon: React.FC<DynamicIconProps>
}

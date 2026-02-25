import { type FC, type InputHTMLAttributes, type Ref, useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from './ui/button'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  ref?: Ref<HTMLInputElement>
  className?: string
  disabled?: boolean
}

const PasswordInput: FC<PasswordInputProps> = ({ className, disabled, ref }) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className={cn('rounded-2md relative', className)}>
      <input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button
        className="absolute end-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground"
        size="icon"
        variant="ghost"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </Button>
    </div>
  )
}

export { PasswordInput }

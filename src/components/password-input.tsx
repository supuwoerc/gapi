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
        autoComplete="off"
        className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
      />
      <Button
        className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground"
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

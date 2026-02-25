import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { sleep } from '@supuwoerc/toolkit'
import { Link as LinkIcon, Loader2, LogIn, QrCode } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { PasswordInput } from '@/components/password-input'

interface AuthFormProps {
  className?: string
  redirectTo?: string
}

const authFormSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

type authForm = z.infer<typeof authFormSchema>

const AuthForm: React.FC<AuthFormProps> = ({ className, redirectTo }) => {
  const navigate = useNavigate()

  const form = useForm<authForm>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const submithandle: SubmitHandler<authForm> = async (data: authForm) => {
    await toast
      .promise(sleep(2000), {
        loading: 'Signing in...',
        success: () => {
          navigate(redirectTo || '/', { replace: true })
          return `Welcome back, ${data.email}!`
        },
        error: 'Error',
      })
      .unwrap()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submithandle)} className={cn('grid gap-3', className)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot-password"
                className="absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" disabled={form.formState.isSubmitting}>
            <QrCode className="h-4 w-4" /> QrCode
          </Button>
          <Button variant="outline" type="button" disabled={form.formState.isSubmitting}>
            <LinkIcon className="h-4 w-4" /> SSO
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default AuthForm

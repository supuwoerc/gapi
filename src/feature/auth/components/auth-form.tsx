import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { sleep } from '@supuwoerc/toolkit'
import { isError } from 'lodash-es'
import { Link as LinkIcon, Loader2, LogIn, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined), // TODO: i18n
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'), // TODO: i18n
})

type authForm = z.infer<typeof authFormSchema>

const AuthForm: React.FC<AuthFormProps> = ({ className, redirectTo }) => {
  const navigate = useNavigate()

  const { t } = useTranslation()

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
        loading: t('auth.signInLoading'),
        success: () => {
          navigate(redirectTo || '/', { replace: true })
          return t('auth.welcomeMessage', { email: data.email })
        },
        error: (err) => {
          if (isError(err)) {
            return err.message
          }
          return t('common.error')
        },
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
              <FormLabel>{t('auth.email')}</FormLabel>
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
              <FormLabel> {t('auth.password')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot-password"
                className="absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                {t('auth.forgotPassword')}
              </Link>
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          {t('auth.signIn')}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span>
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

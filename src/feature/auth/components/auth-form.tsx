import { useEffect } from 'react'

import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation } from '@tanstack/react-query'

import { login } from '@/service/auth/auth'
import SHA256 from 'crypto-js/sha256'
import { isError } from 'lodash-es'
import { Link as LinkIcon, Loader2, LogIn, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { setLoginUser } from '@/store/login-user'

import { i18n } from '@/lib/i18n'
import { reactQueryClient } from '@/lib/react-query'
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
  redirectTo?: string | null
}

const authFormSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, {
      error: () => i18n.t('feature:login.authForm.password.min'),
    })
    .max(20, {
      error: () => i18n.t('feature:login.authForm.password.max'),
    })
    .refine((value) => /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9A-Za-z~!@#$%^&*._?]{8,20}$/.test(value), {
      error: () => i18n.t('feature:login.authForm.password.pattern'),
    }),
})

type authForm = z.infer<typeof authFormSchema>

const AuthForm: React.FC<AuthFormProps> = ({ className, redirectTo }) => {
  const navigate = useNavigate()

  const { t, i18n } = useTranslation(['feature', 'global'])

  const form = useForm<authForm>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      form.trigger()
    }
  }, [i18n.language, form])

  const loginMutation = useMutation({
    mutationFn: login,
  })

  const submithandle: SubmitHandler<authForm> = async (data: authForm) => {
    const hashedData = { ...data, password: SHA256(data.password).toString() }
    await toast
      .promise(loginMutation.mutateAsync(hashedData), {
        loading: t('login.authForm.signInLoading'),
        success: (res) => {
          setLoginUser(res)
          /**
           * 预填缓存，避免登录跳转后 requireAuth 中 ensureQueryData 重复请求
           * Pre-populate cache to avoid redundant ensureQueryData request in requireAuth after login redirect
           */
          reactQueryClient.setQueryData(['userProfile'], res)
          navigate(redirectTo || '/', { replace: true })
          return t('login.authForm.welcomeMessage', { email: data.email })
        },
        error: (err) => {
          if (isError(err)) {
            return err.message
          }
          return t('global:error')
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
              <FormLabel>{t('login.authForm.email.name')}</FormLabel>
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
              <FormLabel> {t('login.authForm.password.name')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot-password"
                className="absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                {t('login.authForm.forgotPassword')}
              </Link>
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          {t('login.authForm.signIn')}
        </Button>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t('global:or')}</span>
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

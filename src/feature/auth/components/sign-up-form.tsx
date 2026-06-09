import { useCallback, useEffect, useRef, useState } from 'react'

import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation } from '@tanstack/react-query'

import { signUp } from '@/service/auth/auth'
import SHA256 from 'crypto-js/sha256'
import { isError } from 'lodash-es'
import { Loader2, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { i18n } from '@/lib/i18n'
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

import { CaptchaDialog } from '@/components/captcha-dialog'
import { PasswordInput } from '@/components/password-input'

interface SignUpFormProps {
  className?: string
}

const signUpFormSchema = z
  .object({
    username: z.string().min(1, {
      error: () => i18n.t('feature:signUp.form.username.name'),
    }),
    email: z.email(),
    password: z
      .string()
      .min(8, {
        error: () => i18n.t('feature:signUp.form.password.min'),
      })
      .max(20, {
        error: () => i18n.t('feature:signUp.form.password.max'),
      })
      .refine((value) => /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9A-Za-z~!@#$%^&*._?]{8,20}$/.test(value), {
        error: () => i18n.t('feature:signUp.form.password.pattern'),
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: () => i18n.t('feature:signUp.form.confirmPassword.mismatch'),
    path: ['confirmPassword'],
  })

type SignUpForm = z.infer<typeof signUpFormSchema>

const SignUpForm: React.FC<SignUpFormProps> = ({ className }) => {
  const navigate = useNavigate()

  const { t, i18n } = useTranslation(['feature', 'global'])

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      form.trigger()
    }
  }, [i18n.language, form])

  const signUpMutation = useMutation({
    mutationFn: signUp,
  })

  const [captchaOpen, setCaptchaOpen] = useState(false)
  const pendingDataRef = useRef<{ username: string; email: string; password: string } | null>(null)

  const submitHandle: SubmitHandler<SignUpForm> = (data) => {
    pendingDataRef.current = {
      username: data.username,
      email: data.email,
      password: SHA256(data.password).toString(),
    }
    setCaptchaOpen(true)
  }

  const handleCaptchaSuccess = useCallback(
    async (token: string) => {
      if (!pendingDataRef.current) return
      await toast
        .promise(
          signUpMutation.mutateAsync({
            ...pendingDataRef.current,
            captcha_token: token,
          }),
          {
            loading: t('signUp.signUpLoading'),
            success: () => {
              navigate('/login', { replace: true })
              return t('signUp.signUpSuccess')
            },
            error: (err) => {
              if (isError(err)) {
                return err.message
              }
              return t('global:error')
            },
          }
        )
        .unwrap()
      pendingDataRef.current = null
    },
    [signUpMutation, navigate, t]
  )

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => form.handleSubmit(submitHandle)(e)}
        className={cn('grid gap-3', className)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('signUp.form.username.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('signUp.form.username.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('signUp.form.email.name')}</FormLabel>
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
            <FormItem>
              <FormLabel>{t('signUp.form.password.name')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('signUp.form.confirmPassword.name')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={signUpMutation.isPending}>
          {signUpMutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {t('signUp.form.submit')}
        </Button>
      </form>
      <CaptchaDialog
        open={captchaOpen}
        onOpenChange={setCaptchaOpen}
        captchaType="slide"
        onSuccess={handleCaptchaSuccess}
      />
    </Form>
  )
}

export default SignUpForm

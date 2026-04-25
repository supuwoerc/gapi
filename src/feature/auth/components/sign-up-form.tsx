import { useEffect } from 'react'

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

  const submitHandle: SubmitHandler<SignUpForm> = async (data) => {
    await toast
      .promise(
        signUpMutation.mutateAsync({
          username: data.username,
          email: data.email,
          password: SHA256(data.password).toString(),
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
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandle)} className={cn('grid gap-3', className)}>
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
        <Button className="mt-2" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {t('signUp.form.submit')}
        </Button>
      </form>
    </Form>
  )
}

export default SignUpForm

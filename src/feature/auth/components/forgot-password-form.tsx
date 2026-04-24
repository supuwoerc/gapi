import { useEffect } from 'react'

import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { sleep } from '@supuwoerc/toolkit'
import { isError } from 'lodash-es'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
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

interface ForgotPasswordFormProps {
  className?: string
}

const forgotPasswordFormSchema = z.object({
  email: z.email(),
})

type forgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className }) => {
  const navigate = useNavigate()

  const { t, i18n } = useTranslation(['feature', 'global'])

  const form = useForm<forgotPasswordForm>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      form.trigger()
    }
  }, [i18n.language, form])

  const submithandle: SubmitHandler<forgotPasswordForm> = async (data: forgotPasswordForm) => {
    await toast
      .promise(sleep(2000), {
        loading: t('global:loading'),
        success: () => {
          navigate('/otp')
          return t('forgotPassword.sendMail', { email: data.email })
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
              <FormLabel>{t('forgotPassword.form.email.name')}</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={form.formState.isSubmitting}>
          {t('global:button.continue')}
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </Button>
      </form>
    </Form>
  )
}

export default ForgotPasswordForm

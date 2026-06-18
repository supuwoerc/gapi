import { useEffect, useState } from 'react'

import { z } from 'zod'

import { type SubmitHandler, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation } from '@tanstack/react-query'

import { updateProfile } from '@/service/user/user'
import { isError } from 'lodash-es'
import { Loader2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { setLoginUser, useLoginUserStore } from '@/store/login-user'

import { i18n } from '@/lib/i18n'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import { ImageCropDialog } from '@/components/image-crop-dialog'

const profileFormSchema = z.object({
  email: z.email(),
  name: z
    .string()
    .min(1, {
      error: () => i18n.t('settings:profile.form.name.required'),
    })
    .max(20, {
      error: () => i18n.t('settings:profile.form.name.max'),
    }),
  bio: z.string().max(100, {
    error: () => i18n.t('settings:profile.form.bio.max'),
  }),
  avatar: z.string(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const ProfilePage = () => {
  const { t, i18n } = useTranslation(['settings', 'global'])
  const loginUser = useLoginUserStore((s) => s.loginUser)
  const [cropperOpen, setCropperOpen] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: loginUser?.user.email ?? '',
      name: loginUser?.user.name ?? '',
      bio: loginUser?.user.bio ?? '',
      avatar: loginUser?.user.avatar ?? '',
    },
  })

  useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      form.trigger()
    }
  }, [i18n.language, form])

  const mutation = useMutation({ mutationFn: updateProfile })

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    await toast
      .promise(
        mutation.mutateAsync({
          name: data.name,
          bio: data.bio,
          avatar: data.avatar,
        }),
        {
          loading: t('profile.form.saving'),
          success: (res) => {
            if (loginUser) {
              setLoginUser({
                ...loginUser,
                user: {
                  ...loginUser.user,
                  name: res.name,
                  avatar: res.avatar,
                  bio: res.bio,
                },
              })
            }
            return t('profile.form.saveSuccess')
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

  const handleCropComplete = (blob: Blob) => {
    const reader = new FileReader()
    reader.onload = () => {
      form.setValue('avatar', reader.result as string, { shouldDirty: true })
    }
    reader.readAsDataURL(blob)
    setCropperOpen(false)
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('profile.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('profile.description')}</p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-6">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.form.avatar.label')}</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Avatar className="size-16 cursor-pointer" onClick={() => setCropperOpen(true)}>
                      <AvatarImage src={field.value} />
                      <AvatarFallback>{form.getValues('name')?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </FormControl>
                <FormDescription>{t('profile.form.avatar.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.form.email.label')}</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-muted" />
                </FormControl>
                <FormDescription>{t('profile.form.email.description')}</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.form.name.label')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    maxLength={20}
                    placeholder={t('profile.form.name.placeholder')}
                  />
                </FormControl>
                <FormDescription>{t('profile.form.name.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.form.bio.label')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    maxLength={100}
                    placeholder={t('profile.form.bio.placeholder')}
                  />
                </FormControl>
                <FormDescription>{t('profile.form.bio.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {t('profile.form.submit')}
          </Button>
        </form>
      </Form>

      <ImageCropDialog
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        onCropComplete={handleCropComplete}
        initialImage={form.getValues('avatar') || undefined}
        title={t('profile.form.avatar.dialogTitle')}
        shape="circle"
        maxOutputSize={256}
      />
    </div>
  )
}

export default ProfilePage

import * as React from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import type { ProjectMutation } from '@/schema/project/project'
import { projectMutationSchema } from '@/schema/project/project'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { ProjectLogoPicker } from './project-logo'

const DefaultProjectLogo = 'https://api.dicebear.com/9.x/shapes/svg?seed=gapi-project'

interface CreateProjectDialogProps {
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProjectMutation) => void
}

export function CreateProjectDialog({
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const { t } = useTranslation('projects')
  const form = useForm<ProjectMutation>({
    resolver: zodResolver(projectMutationSchema),
    defaultValues: {
      name: '',
      description: '',
      logo: DefaultProjectLogo,
      visibility: 'private',
    },
  })
  const projectName = useWatch({ control: form.control, name: 'name' })

  React.useEffect(() => {
    if (!open) {
      form.reset({ name: '', description: '', logo: DefaultProjectLogo, visibility: 'private' })
    }
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createDialog.logo')}</FormLabel>
                  <FormControl>
                    <ProjectLogoPicker
                      logo={field.value}
                      name={projectName || t('createDialog.logoFallback')}
                      disabled={isPending}
                      dialogTitle={t('createDialog.logoDialogTitle')}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>{t('createDialog.logoDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createDialog.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('createDialog.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createDialog.projectDescription')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('createDialog.descriptionPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createDialog.visibility')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="private">{t('visibility.private')}</SelectItem>
                        <SelectItem value="public">{t('visibility.public')}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('createDialog.saving') : t('createDialog.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

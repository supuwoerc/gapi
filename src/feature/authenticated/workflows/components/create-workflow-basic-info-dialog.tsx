'use no memo'

import type { UseFormReturn } from 'react-hook-form'

import type { WorkflowBasicInfo } from '@/schema/workflow/workflow'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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

interface CreateWorkflowBasicInfoDialogProps {
  form: UseFormReturn<WorkflowBasicInfo>
  open: boolean
  readOnly?: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkflowBasicInfoDialog({
  form,
  open,
  readOnly,
  onOpenChange,
}: CreateWorkflowBasicInfoDialogProps) {
  const { t } = useTranslation('workflows')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createPage.basicInfo')}</DialogTitle>
          <DialogDescription>{t('createPage.basicInfoDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createPage.type')}</FormLabel>
                  <Select value={field.value} disabled={readOnly} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="project">{t('types.project')}</SelectItem>
                        <SelectItem value="employee">{t('types.employee')}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('createPage.typeDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createPage.name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('createPage.namePlaceholder')}
                      disabled={readOnly}
                      {...field}
                    />
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
                  <FormLabel>{t('createPage.workflowDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-28"
                      placeholder={t('createPage.descriptionPlaceholder')}
                      disabled={readOnly}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('createPage.draftOnly')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">{t('createPage.done')}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

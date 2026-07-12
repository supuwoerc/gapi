'use no memo'

import { useEffect, useState } from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import type { WorkflowMutation } from '@/schema/workflow/workflow'
import { workflowMutationSchema } from '@/schema/workflow/workflow'
import { ArrowLeft, CircleAlert, CircleCheck, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { CreateWorkflowBasicInfoDialog } from './components/create-workflow-basic-info-dialog'
import { CreateWorkflowDesignCard } from './components/create-workflow-design-card'

const CreateWorkflowPage = () => {
  const { t, i18n } = useTranslation('workflows')
  const navigate = useNavigate()
  const [basicInfoOpen, setBasicInfoOpen] = useState(false)
  const basicInfoForm = useForm<WorkflowMutation>({
    resolver: zodResolver(workflowMutationSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  })
  const basicInfoValues = useWatch({ control: basicInfoForm.control })
  const hasValidBasicInfo =
    Boolean(basicInfoValues.name?.trim()) && Boolean(basicInfoValues.description?.trim())

  const handleSave = async () => {
    const isBasicInfoValid = await basicInfoForm.trigger()

    if (!isBasicInfoValid) {
      setBasicInfoOpen(true)
      toast.warning(t('createPage.basicInfoRequired'))
      return
    }

    toast.info(t('createPage.saveUnavailable'))
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (Object.keys(basicInfoForm.formState.errors).length) {
      void basicInfoForm.trigger()
    }
  }, [i18n.language, basicInfoForm])

  return (
    <>
      <AppHeader fixed>
        <Search />
        <div className="ms-auto flex items-center gap-4">
          <ThemeModeSwitcher />
          <LanguageSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <AppMain className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-4">
          <Button variant="ghost" className="w-fit px-2" onClick={() => void navigate('/workflow')}>
            <ArrowLeft />
            {t('createPage.back')}
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold tracking-tight">{t('createPage.title')}</h2>
              <p className="text-muted-foreground">{t('createPage.description')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setBasicInfoOpen(true)}>
                {hasValidBasicInfo ? (
                  <CircleCheck className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <CircleAlert className="text-amber-600 dark:text-amber-400" />
                )}
                {t('createPage.basicInfo')}
              </Button>
              <Button onClick={() => void handleSave()}>
                <Save />
                {t('createPage.save')}
              </Button>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <CreateWorkflowDesignCard />
        </div>
        <CreateWorkflowBasicInfoDialog
          form={basicInfoForm}
          open={basicInfoOpen}
          onOpenChange={setBasicInfoOpen}
        />
      </AppMain>
    </>
  )
}

export default CreateWorkflowPage

'use no memo'

import { useEffect, useState } from 'react'

import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import type { WorkflowDetail, WorkflowMutation } from '@/schema/workflow/workflow'
import { workflowMutationSchema } from '@/schema/workflow/workflow'
import { ArrowLeft, CircleAlert, CircleCheck, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { CreateWorkflowBasicInfoDialog } from './create-workflow-basic-info-dialog'
import { WorkflowBasicInfoHoverCard } from './workflow-basic-info-hover-card'
import { WorkflowDesignCard } from './workflow-design-card'

interface WorkflowEditorPageProps {
  mode: 'create' | 'detail'
  workflow?: WorkflowDetail
  loading?: boolean
  canEdit?: boolean
  notFound?: boolean
}

export function WorkflowEditorPage({
  mode,
  workflow,
  loading,
  canEdit,
  notFound,
}: WorkflowEditorPageProps) {
  const { t, i18n } = useTranslation('workflows')
  const navigate = useNavigate()
  const [basicInfoOpen, setBasicInfoOpen] = useState(false)
  const isEditable = mode === 'create' || !!canEdit
  const useBasicInfoHoverCard = mode === 'detail' && !isEditable
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
  const pageTitle =
    mode === 'create' ? t('createPage.title') : basicInfoValues.name?.trim() || t('detail.title')
  const pageDescription =
    mode === 'create'
      ? t('createPage.description')
      : basicInfoValues.description?.trim() || t('detail.description')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (mode !== 'detail' || !workflow) return

    basicInfoForm.reset({
      name: workflow.name,
      description: workflow.description,
    })
  }, [basicInfoForm, mode, workflow])

  useEffect(() => {
    if (Object.keys(basicInfoForm.formState.errors).length) {
      void basicInfoForm.trigger()
    }
  }, [i18n.language, basicInfoForm])

  const handleSave = async () => {
    if (!isEditable) return

    const isBasicInfoValid = await basicInfoForm.trigger()

    if (!isBasicInfoValid) {
      setBasicInfoOpen(true)
      toast.warning(t('createPage.basicInfoRequired'))
      return
    }

    toast.info(t('createPage.saveUnavailable'))
  }

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
            {t(mode === 'create' ? 'createPage.back' : 'detail.back')}
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
              <p className="text-muted-foreground">{pageDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {useBasicInfoHoverCard ? (
                <WorkflowBasicInfoHoverCard workflow={workflow} loading={loading} canEdit={false} />
              ) : (
                <Button
                  variant="outline"
                  disabled={loading || notFound}
                  onClick={() => setBasicInfoOpen(true)}
                >
                  {hasValidBasicInfo ? (
                    <CircleCheck className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CircleAlert className="text-amber-600 dark:text-amber-400" />
                  )}
                  {t('createPage.basicInfo')}
                </Button>
              )}
              {isEditable ? (
                <Button disabled={loading || notFound} onClick={() => void handleSave()}>
                  <Save />
                  {t('createPage.save')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {notFound ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              {t('detail.notFound')}
            </CardContent>
          </Card>
        ) : (
          <div className="min-w-0">
            <WorkflowDesignCard
              flow={workflow?.flow}
              loading={loading}
              editable={isEditable && !loading}
            />
          </div>
        )}

        {useBasicInfoHoverCard ? null : (
          <CreateWorkflowBasicInfoDialog
            form={basicInfoForm}
            open={basicInfoOpen}
            readOnly={!isEditable}
            onOpenChange={setBasicInfoOpen}
          />
        )}
      </AppMain>
    </>
  )
}

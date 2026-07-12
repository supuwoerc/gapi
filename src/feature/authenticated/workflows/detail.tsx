'use no memo'

import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getWorkflowDetail } from '@/service/workflows/workflows'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { useLoginUserStore } from '@/store/login-user'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { WorkflowBasicInfoHoverCard } from './components/workflow-basic-info-hover-card'
import { WorkflowDesignCard } from './components/workflow-design-card'

const WorkflowDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const workflowId = Number(id)
  const navigate = useNavigate()
  const { t } = useTranslation('workflows')
  const loginUser = useLoginUserStore((state) => state.loginUser)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { data: detail, isLoading } = useQuery({
    queryKey: ['workflow-detail', workflowId],
    queryFn: () => getWorkflowDetail({ id: workflowId }),
    enabled: !Number.isNaN(workflowId),
  })

  const workflow = detail?.data
  const canEdit =
    !!workflow &&
    (workflow.creator.id === loginUser?.user.id || workflow.creator.email === loginUser?.user.email)

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" className="px-2" onClick={() => void navigate('/workflow')}>
            <ArrowLeft />
            {t('detail.back')}
          </Button>
          <WorkflowBasicInfoHoverCard workflow={workflow} loading={isLoading} canEdit={canEdit} />
        </div>

        {!isLoading && !workflow ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              {t('detail.notFound')}
            </CardContent>
          </Card>
        ) : (
          <div className="min-w-0">
            <WorkflowDesignCard workflow={workflow} loading={isLoading} canEdit={canEdit} />
          </div>
        )}
      </AppMain>
    </>
  )
}

export default WorkflowDetailPage

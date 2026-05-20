'use no memo'

import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getTaskDetail } from '@/service/tasks/detail'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { Button } from '@/components/ui/button'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { TaskCommentsCard } from './components/task-comments-card'
import { TaskInfoCard, TaskLevelBadge } from './components/task-info-card'
import { TaskTimelineCard } from './components/task-timeline-card'

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('feature')
  const navigate = useNavigate()
  const taskId = Number(id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { data: detail, isLoading } = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: () => getTaskDetail({ id: taskId }),
    enabled: !Number.isNaN(taskId),
  })

  const task = detail?.data

  return (
    <>
      <AppHeader fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeModeSwitcher />
          <LanguageSwitcher />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </AppHeader>
      <AppMain className="flex flex-col gap-2 sm:gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="link"
            onClick={() => navigate(-1)}
            className="gap-1 px-0! text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t('taskDetail.back')}
          </Button>
        </div>

        {task && (
          <div className="flex items-center gap-3">
            <h2 className="max-w-[600px] truncate text-2xl font-bold tracking-tight text-primary">
              {task.title}
            </h2>
            <TaskLevelBadge level={task.level} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            <TaskInfoCard task={task} loading={isLoading} />
            <TaskCommentsCard taskId={taskId} />
          </div>
          <div className="self-start">
            <TaskTimelineCard taskId={taskId} />
          </div>
        </div>
      </AppMain>
    </>
  )
}

export default TaskDetailPage

'use no memo'

import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getTaskDetail } from '@/service/tasks/detail'
import { useParams } from 'react-router'

import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageSwitcher } from '@/components/language-switcher'
import AppHeader from '@/components/layout/authenticated/app-header'
import AppMain from '@/components/layout/authenticated/app-main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import Search from '@/components/search'
import { ThemeModeSwitcher } from '@/components/theme-mode-switcher'

import { TaskCommentsCard } from './components/task-comments-card'
import { TaskInfoCard, TaskSidebarInfoCard } from './components/task-info-card'
import { TaskTimelineCard } from './components/task-timeline-card'

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>()
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
      <AppMain className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            <TaskInfoCard task={task} loading={isLoading} />
            <TaskCommentsCard taskId={taskId} />
          </div>
          <div className="space-y-3">
            <TaskSidebarInfoCard task={task} loading={isLoading} />
            <TaskTimelineCard
              taskId={taskId}
              className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)]"
            />
          </div>
        </div>
      </AppMain>
    </>
  )
}

export default TaskDetailPage

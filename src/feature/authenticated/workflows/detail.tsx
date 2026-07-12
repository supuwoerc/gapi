'use no memo'

import { useQuery } from '@tanstack/react-query'

import { getWorkflowDetail } from '@/service/workflows/workflows'
import { useParams } from 'react-router'

import { useLoginUserStore } from '@/store/login-user'

import { WorkflowEditorPage } from './components/workflow-editor-page'

const WorkflowDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const workflowId = Number(id)
  const loginUser = useLoginUserStore((state) => state.loginUser)

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
    <WorkflowEditorPage
      mode="detail"
      workflow={workflow}
      loading={isLoading}
      canEdit={canEdit}
      notFound={!isLoading && !workflow}
    />
  )
}

export default WorkflowDetailPage

'use no memo'

import type { WorkflowNodeKind, WorkflowNodeStatus } from '@/schema/workflow/workflow'
import { Bot, CheckCircle2, CircleDot, Flag, GitPullRequest, Play } from 'lucide-react'

export const WorkflowNodeKinds = [
  'start',
  'review',
  'approval',
  'automation',
  'ai_employee',
  'end',
] satisfies WorkflowNodeKind[]

export const WorkflowNodeStatuses = ['pending', 'active', 'done'] satisfies WorkflowNodeStatus[]

export const workflowNodeKindIconMap = {
  start: Play,
  review: GitPullRequest,
  approval: CheckCircle2,
  automation: Bot,
  ai_employee: Bot,
  end: Flag,
} satisfies Record<WorkflowNodeKind, typeof CircleDot>

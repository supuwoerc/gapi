import type {
  Workflow,
  WorkflowDetail,
  WorkflowFlow,
  WorkflowMutation,
  WorkflowType,
  WorkflowUser,
} from '@/schema/workflow/workflow'
import { faker } from '@faker-js/faker'

import { users } from './users'

faker.seed(97531)

const now = new Date('2026-06-01T08:00:00.000Z')
const workflowFlows = new Map<number, WorkflowFlow>()
let nextWorkflowId = 10000

const projectWorkflowSeeds = [
  ['API Review', 'Review API contracts, ownership, and release readiness before delivery.'],
  ['Bug Triage', 'Classify incoming issues and route them to the right project owners.'],
  ['Release Approval', 'Coordinate checklist review, approvals, and rollout communication.'],
  ['Document Review', 'Collect document feedback and verify required updates before publishing.'],
  ['Access Request', 'Route access requests through project owners and compliance checks.'],
  ['Incident Follow-up', 'Capture incident actions, owners, and postmortem documentation.'],
  ['Change Control', 'Review production changes with dependency and rollback checks.'],
  ['Dependency Audit', 'Track dependency review, security notes, and remediation progress.'],
]

const employeeWorkflowSeeds = [
  ['Issue Diagnosis', 'Inspect issue context, reproduce the problem, and prepare a fix plan.'],
  ['Pull Request Review', 'Review code diffs, summarize risks, and suggest targeted changes.'],
  ['Test Repair', 'Analyze failing tests and propose minimal repair steps.'],
  ['Dependency Upgrade', 'Upgrade dependencies and validate compatibility notes.'],
]

function toWorkflowUser(user: (typeof users)[number]): WorkflowUser {
  return {
    id: user.id,
    name: user.username,
    email: user.email,
    avatar: user.avatar,
  }
}

function createWorkflowFlow(
  index: number,
  name: string,
  type: WorkflowType = 'project'
): WorkflowFlow {
  const hasAutomation = index % 2 === 0
  const hasAiEmployee = type === 'project' && index % 4 === 0
  const subject = name.replace(/\s+\d+$/, '')
  const reviewX = hasAutomation || hasAiEmployee ? 260 : 300
  const actionX = hasAutomation || hasAiEmployee ? 520 : 600
  const approvalX = hasAutomation || hasAiEmployee ? 780 : 600
  const endX = hasAutomation || hasAiEmployee ? 1040 : 900

  return {
    nodes: [
      {
        id: `workflow-${index}-start`,
        type: 'workflow',
        position: { x: 0, y: 96 },
        data: {
          title: 'Start',
          description: `${subject} request is submitted.`,
          kind: 'start',
          status: 'done',
        },
      },
      {
        id: `workflow-${index}-review`,
        type: 'workflow',
        position: { x: reviewX, y: hasAutomation ? 24 : 96 },
        data: {
          title: 'Owner review',
          description: 'Review scope, owner, and required context.',
          kind: 'review',
          status: 'active',
        },
      },
      ...(hasAutomation
        ? [
            {
              id: `workflow-${index}-automation`,
              type: 'workflow' as const,
              position: { x: actionX, y: 24 },
              data: {
                title: 'Automated checks',
                description: 'Run policy, dependency, and readiness checks.',
                kind: 'automation' as const,
                status: 'active' as const,
              },
            },
          ]
        : []),
      ...(hasAiEmployee
        ? [
            {
              id: `workflow-${index}-ai-employee`,
              type: 'workflow' as const,
              position: { x: actionX, y: hasAutomation ? 168 : 96 },
              data: {
                title: 'AI employee',
                description: 'Ask a sandbox agent to inspect issue or PR context.',
                kind: 'ai_employee' as const,
                status: 'pending' as const,
                ai_employee_id: null,
                employee_workflow_id: null,
              },
            },
          ]
        : []),
      {
        id: `workflow-${index}-approval`,
        type: 'workflow',
        position: { x: approvalX, y: 96 },
        data: {
          title: 'Approval',
          description: 'Confirm the decision and notify linked projects.',
          kind: 'approval',
          status: 'pending',
        },
      },
      {
        id: `workflow-${index}-end`,
        type: 'workflow',
        position: { x: endX, y: 96 },
        data: {
          title: 'Complete',
          description: 'Archive outcome and publish the final status.',
          kind: 'end',
          status: 'pending',
        },
      },
    ],
    edges: [
      {
        id: `workflow-${index}-start-review`,
        source: `workflow-${index}-start`,
        target: `workflow-${index}-review`,
        type: 'smoothstep',
      },
      ...(hasAutomation
        ? [
            {
              id: `workflow-${index}-start-automation`,
              source: `workflow-${index}-start`,
              target: `workflow-${index}-automation`,
              type: 'smoothstep',
            },
            {
              id: `workflow-${index}-automation-approval`,
              source: `workflow-${index}-automation`,
              target: `workflow-${index}-approval`,
              type: 'smoothstep',
            },
          ]
        : []),
      ...(hasAiEmployee
        ? [
            {
              id: `workflow-${index}-review-ai-employee`,
              source: `workflow-${index}-review`,
              target: `workflow-${index}-ai-employee`,
              type: 'smoothstep',
            },
            {
              id: `workflow-${index}-ai-employee-approval`,
              source: `workflow-${index}-ai-employee`,
              target: `workflow-${index}-approval`,
              type: 'smoothstep',
            },
          ]
        : []),
      {
        id: `workflow-${index}-review-approval`,
        source: `workflow-${index}-review`,
        target: `workflow-${index}-approval`,
        type: 'smoothstep',
      },
      {
        id: `workflow-${index}-approval-end`,
        source: `workflow-${index}-approval`,
        target: `workflow-${index}-end`,
        type: 'smoothstep',
      },
    ],
  }
}

function createWorkflow(
  index: number,
  name: string,
  description: string,
  type: WorkflowType = 'project'
): Workflow {
  const createdAt = new Date(now)
  createdAt.setDate(createdAt.getDate() - index * 2)

  const updatedAt = new Date(createdAt)
  updatedAt.setDate(updatedAt.getDate() + faker.number.int({ min: 0, max: 6 }))

  return {
    id: 2000 + index,
    name,
    description,
    type,
    used_count: faker.number.int({ min: 0, max: 24 }),
    creator: toWorkflowUser(index % 4 === 0 ? users[0] : users[(index % 12) + 1]),
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

export function getWorkflowDetail(id: number): WorkflowDetail | undefined {
  const workflow = workflows.find((item) => item.id === id)
  if (!workflow) return undefined

  const flow =
    workflowFlows.get(workflow.id) ?? createWorkflowFlow(workflow.id, workflow.name, workflow.type)
  workflowFlows.set(workflow.id, flow)

  return {
    ...workflow,
    flow,
  }
}

export function createWorkflowWithFlow(data: WorkflowMutation): WorkflowDetail {
  const now = new Date()
  const workflow: Workflow = {
    id: nextWorkflowId++,
    name: data.name,
    description: data.description,
    type: data.type,
    used_count: 0,
    creator: toWorkflowUser(users[0]),
    created_at: now,
    updated_at: now,
  }

  workflows.unshift(workflow)
  workflowFlows.set(workflow.id, data.flow)

  return {
    ...workflow,
    flow: data.flow,
  }
}

export function updateWorkflowWithFlow(
  id: number,
  data: WorkflowMutation
): WorkflowDetail | undefined {
  const workflow = workflows.find((item) => item.id === id)
  if (!workflow) return undefined

  workflow.name = data.name
  workflow.description = data.description
  workflow.type = data.type
  workflow.updated_at = new Date()
  workflowFlows.set(workflow.id, data.flow)

  return {
    ...workflow,
    flow: data.flow,
  }
}

export function syncProjectWorkflowUsedCounts(
  links: { project_id: number; workflow_id: number }[]
) {
  const usedCounts = new Map<number, number>()

  for (const link of links) {
    usedCounts.set(link.workflow_id, (usedCounts.get(link.workflow_id) ?? 0) + 1)
  }

  for (const workflow of workflows) {
    if (workflow.type === 'project') {
      workflow.used_count = usedCounts.get(workflow.id) ?? 0
    }
  }
}

export function syncEmployeeWorkflowUsedCounts(
  links: { ai_employee_id: number; workflow_id: number }[]
) {
  const usedCounts = new Map<number, number>()

  for (const link of links) {
    usedCounts.set(link.workflow_id, (usedCounts.get(link.workflow_id) ?? 0) + 1)
  }

  for (const workflow of workflows) {
    if (workflow.type === 'employee') {
      workflow.used_count = usedCounts.get(workflow.id) ?? 0
    }
  }
}

export const workflows: Workflow[] = [
  ...projectWorkflowSeeds.map(([name, description], index) =>
    createWorkflow(index, name, description, 'project')
  ),
  ...employeeWorkflowSeeds.map(([name, description], index) =>
    createWorkflow(projectWorkflowSeeds.length + index, name, description, 'employee')
  ),
]

for (const workflow of workflows) {
  workflowFlows.set(workflow.id, createWorkflowFlow(workflow.id, workflow.name, workflow.type))
}

const projectWorkflowSeedCount = projectWorkflowSeeds.length + employeeWorkflowSeeds.length

const employeeWorkflowSubjects = [
  'Issue Fix',
  'PR Polish',
  'Test Stabilization',
  'Refactor Assist',
  'Release Note Draft',
  'CI Failure Repair',
  'Dependency Patch',
  'Code Review',
] as const

const workflowSubjects = [
  'SDK Onboarding',
  'Security Exception',
  'Schema Migration',
  'Mock Publishing',
  'Contract Validation',
  'Partner Handoff',
  'Data Retention',
  'Quality Gate',
  'Architecture Review',
  'Support Escalation',
] as const

for (let index = 0; index < 16; index++) {
  const subject = employeeWorkflowSubjects[index % employeeWorkflowSubjects.length]
  const workflow = createWorkflow(
    projectWorkflowSeedCount + index,
    `${subject} ${String(index + 1).padStart(2, '0')}`,
    `${subject} workflow for sandbox agents handling issues, pull requests, and validation tasks.`,
    'employee'
  )
  workflows.push(workflow)
  workflowFlows.set(workflow.id, createWorkflowFlow(workflow.id, workflow.name, workflow.type))
}

const generatedProjectWorkflowStart = projectWorkflowSeedCount + 16

for (let index = 0; index < 48; index++) {
  const subject = workflowSubjects[index % workflowSubjects.length]
  const workflow = createWorkflow(
    generatedProjectWorkflowStart + index,
    `${subject} ${String(index + 1).padStart(2, '0')}`,
    `${subject} workflow for coordinating project handoffs, checks, and follow-up actions.`,
    'project'
  )
  workflows.push(workflow)
  workflowFlows.set(workflow.id, createWorkflowFlow(workflow.id, workflow.name, workflow.type))
}

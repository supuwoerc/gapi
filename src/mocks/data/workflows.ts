import type { Workflow } from '@/schema/workflow/workflow'
import { faker } from '@faker-js/faker'

faker.seed(97531)

const now = new Date('2026-06-01T08:00:00.000Z')

const workflowSeeds = [
  ['API Review', 'Review API contracts, ownership, and release readiness before delivery.'],
  ['Bug Triage', 'Classify incoming issues and route them to the right project owners.'],
  ['Release Approval', 'Coordinate checklist review, approvals, and rollout communication.'],
  ['Document Review', 'Collect document feedback and verify required updates before publishing.'],
  ['Access Request', 'Route access requests through project owners and compliance checks.'],
  ['Incident Follow-up', 'Capture incident actions, owners, and postmortem documentation.'],
  ['Change Control', 'Review production changes with dependency and rollback checks.'],
  ['Dependency Audit', 'Track dependency review, security notes, and remediation progress.'],
]

function createWorkflow(index: number, name: string, description: string): Workflow {
  const createdAt = new Date(now)
  createdAt.setDate(createdAt.getDate() - index * 2)

  const updatedAt = new Date(createdAt)
  updatedAt.setDate(updatedAt.getDate() + faker.number.int({ min: 0, max: 6 }))

  return {
    id: 2000 + index,
    name,
    description,
    used_count: faker.number.int({ min: 0, max: 24 }),
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

export const workflows: Workflow[] = workflowSeeds.map(([name, description], index) =>
  createWorkflow(index, name, description)
)

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

for (let index = 0; index < 48; index++) {
  const subject = workflowSubjects[index % workflowSubjects.length]
  workflows.push(
    createWorkflow(
      workflowSeeds.length + index,
      `${subject} ${String(index + 1).padStart(2, '0')}`,
      `${subject} workflow for coordinating project handoffs, checks, and follow-up actions.`
    )
  )
}

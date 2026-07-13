import type {
  AiEmployee,
  AiEmployeeCodeProvider,
  AiEmployeeMutation,
  AiEmployeeStatus,
} from '@/schema/ai-employee/ai-employee'
import { faker } from '@faker-js/faker'

import { syncEmployeeWorkflowUsedCounts, workflows } from './workflows'

faker.seed(86420)

let nextAiEmployeeId = 3000

const aiEmployeeSeeds = [
  ['Issue Fixer', 'Investigates GitHub or GitLab issues and prepares targeted code changes.'],
  ['PR Reviewer', 'Reviews pull requests, summarizes risk, and suggests practical improvements.'],
  ['Test Stabilizer', 'Repairs failing tests and validates minimal changes in sandbox runs.'],
  ['Dependency Assistant', 'Checks dependency upgrades and compatibility notes before PR updates.'],
  ['Release Helper', 'Drafts release notes and checks PR readiness for project owners.'],
  ['Codebase Scout', 'Explores unfamiliar repositories and prepares issue implementation plans.'],
] as const

const defaultModels = ['gpt-5', 'gpt-5-mini', 'gpt-4.1'] as const

export const aiEmployees: AiEmployee[] = []
export const aiEmployeeWorkflowLinks: { ai_employee_id: number; workflow_id: number }[] = []

function avatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`
}

function makeAiEmployee(
  index: number,
  name: string,
  description: string,
  status: AiEmployeeStatus = 'active',
  codeProvider: AiEmployeeCodeProvider = index % 2 === 0 ? 'github' : 'gitlab'
): AiEmployee {
  const createdAt = faker.date.recent({ days: 45 })
  const updatedAt = new Date(createdAt)
  updatedAt.setDate(updatedAt.getDate() + faker.number.int({ min: 0, max: 12 }))

  return {
    id: nextAiEmployeeId++,
    name,
    description,
    avatar: avatarUrl(name),
    status,
    code_provider: codeProvider,
    default_model: defaultModels[index % defaultModels.length],
    system_prompt:
      'You are a sandbox coding agent. Inspect repository context, make minimal changes, and explain risk clearly.',
    workflow_count: 0,
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

function syncAiEmployeeWorkflowCounts() {
  const usedCounts = new Map<number, number>()

  for (const link of aiEmployeeWorkflowLinks) {
    usedCounts.set(link.ai_employee_id, (usedCounts.get(link.ai_employee_id) ?? 0) + 1)
  }

  for (const employee of aiEmployees) {
    employee.workflow_count = usedCounts.get(employee.id) ?? 0
  }

  syncEmployeeWorkflowUsedCounts(aiEmployeeWorkflowLinks)
}

function seedAiEmployeeWorkflowLinks(aiEmployeeId: number, seedIndex: number) {
  const employeeWorkflows = workflows.filter((workflow) => workflow.type === 'employee')
  if (!employeeWorkflows.length) return

  const count = (seedIndex % 3) + 1
  const start = seedIndex % employeeWorkflows.length

  for (let index = 0; index < count; index++) {
    const workflow = employeeWorkflows[(start + index * 3) % employeeWorkflows.length]
    aiEmployeeWorkflowLinks.push({ ai_employee_id: aiEmployeeId, workflow_id: workflow.id })
  }
}

export function createAiEmployee(data: AiEmployeeMutation) {
  const now = new Date()
  const employee: AiEmployee = {
    id: nextAiEmployeeId++,
    name: data.name,
    description: data.description,
    avatar: data.avatar || avatarUrl(data.name),
    status: data.status,
    code_provider: data.code_provider,
    default_model: data.default_model,
    system_prompt: data.system_prompt,
    workflow_count: 0,
    created_at: now,
    updated_at: now,
  }

  aiEmployees.unshift(employee)
  return employee
}

export function updateAiEmployee(id: number, data: AiEmployeeMutation) {
  const employee = aiEmployees.find((item) => item.id === id)
  if (!employee) return null

  employee.name = data.name
  employee.description = data.description
  employee.avatar = data.avatar || avatarUrl(data.name)
  employee.status = data.status
  employee.code_provider = data.code_provider
  employee.default_model = data.default_model
  employee.system_prompt = data.system_prompt
  employee.updated_at = new Date()

  return employee
}

export function deleteAiEmployees(ids: number[]) {
  const idSet = new Set(ids)

  for (let index = aiEmployees.length - 1; index >= 0; index--) {
    if (idSet.has(aiEmployees[index].id)) {
      aiEmployees.splice(index, 1)
    }
  }

  for (let index = aiEmployeeWorkflowLinks.length - 1; index >= 0; index--) {
    if (idSet.has(aiEmployeeWorkflowLinks[index].ai_employee_id)) {
      aiEmployeeWorkflowLinks.splice(index, 1)
    }
  }

  syncAiEmployeeWorkflowCounts()
}

export function getAiEmployeeWorkflows(aiEmployeeId: number) {
  return aiEmployeeWorkflowLinks
    .filter((link) => link.ai_employee_id === aiEmployeeId)
    .map((link) => workflows.find((workflow) => workflow.id === link.workflow_id))
    .filter(
      (workflow): workflow is (typeof workflows)[number] =>
        workflow !== undefined && workflow.type === 'employee'
    )
}

export function updateAiEmployeeWorkflows(aiEmployeeId: number, workflowIds: number[]) {
  const employee = aiEmployees.find((item) => item.id === aiEmployeeId)
  if (!employee) return null

  const existingWorkflowIds = new Set(
    workflows.filter((workflow) => workflow.type === 'employee').map((workflow) => workflow.id)
  )
  const uniqueWorkflowIds = Array.from(new Set(workflowIds))

  if (uniqueWorkflowIds.some((workflowId) => !existingWorkflowIds.has(workflowId))) {
    return null
  }

  for (let index = aiEmployeeWorkflowLinks.length - 1; index >= 0; index--) {
    if (aiEmployeeWorkflowLinks[index].ai_employee_id === aiEmployeeId) {
      aiEmployeeWorkflowLinks.splice(index, 1)
    }
  }

  for (const workflowId of uniqueWorkflowIds) {
    aiEmployeeWorkflowLinks.push({ ai_employee_id: aiEmployeeId, workflow_id: workflowId })
  }

  employee.updated_at = new Date()
  syncAiEmployeeWorkflowCounts()
  return getAiEmployeeWorkflows(aiEmployeeId)
}

for (const [index, [name, description]] of aiEmployeeSeeds.entries()) {
  const employee = makeAiEmployee(index, name, description, index === 4 ? 'disabled' : 'active')
  aiEmployees.push(employee)
  seedAiEmployeeWorkflowLinks(employee.id, index)
}

syncAiEmployeeWorkflowCounts()

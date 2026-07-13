import {
  aiEmployeeWorkflowLinks,
  aiEmployees,
  getAiEmployeeWorkflows,
  updateAiEmployeeWorkflows,
} from '@/mocks/data/ai-employees'
import {
  getProjectWorkflowAiNodeConfigs,
  getProjectWorkflows,
  projects,
  updateProjectWorkflowAiNodeConfig,
} from '@/mocks/data/projects'
import { getWorkflowDetail, workflows } from '@/mocks/data/workflows'
import { aiEmployeeWorkflowIdsMutationSchema } from '@/schema/ai-employee/ai-employee'
import { workflowMutationSchema } from '@/schema/workflow/workflow'
import { afterEach, describe, expect, test } from 'vitest'

const employee = aiEmployees[0]
const originalEmployeeWorkflowIds = getAiEmployeeWorkflows(employee.id).map(
  (workflow) => workflow.id
)

function countEmployeeWorkflowLinks(workflowId: number) {
  return aiEmployeeWorkflowLinks.filter((link) => link.workflow_id === workflowId).length
}

afterEach(() => {
  updateAiEmployeeWorkflows(employee.id, originalEmployeeWorkflowIds)
})

describe('AI employee schemas', () => {
  test('coerces string workflow ids, deduplicates, and allows empty arrays', () => {
    expect(
      aiEmployeeWorkflowIdsMutationSchema.parse({
        workflow_ids: ['2020', 2021, '2020'],
      })
    ).toEqual({ workflow_ids: [2020, 2021] })

    expect(aiEmployeeWorkflowIdsMutationSchema.parse({ workflow_ids: [] })).toEqual({
      workflow_ids: [],
    })
  })

  test('rejects AI employee nodes inside employee workflows', () => {
    const result = workflowMutationSchema.safeParse({
      type: 'employee',
      name: 'Employee workflow',
      description: 'Runs inside an AI employee.',
      flow: {
        nodes: [
          {
            id: 'start',
            type: 'workflow',
            position: { x: 0, y: 0 },
            data: {
              title: 'Start',
              description: 'Start',
              kind: 'start',
              status: 'active',
            },
          },
          {
            id: 'ai',
            type: 'workflow',
            position: { x: 200, y: 0 },
            data: {
              title: 'AI',
              description: 'Nested AI employee',
              kind: 'ai_employee',
              status: 'pending',
            },
          },
          {
            id: 'end',
            type: 'workflow',
            position: { x: 400, y: 0 },
            data: {
              title: 'End',
              description: 'End',
              kind: 'end',
              status: 'pending',
            },
          },
        ],
        edges: [],
      },
    })

    expect(result.success).toBe(false)
  })
})

describe('AI employee workflow mock data', () => {
  test('updates employee workflow links and synchronizes employee workflow used counts', () => {
    const employeeWorkflows = workflows.filter((workflow) => workflow.type === 'employee')
    const nextWorkflowIds = [
      employeeWorkflows[0].id,
      employeeWorkflows[1].id,
      employeeWorkflows[0].id,
    ]

    const updatedWorkflows = updateAiEmployeeWorkflows(employee.id, nextWorkflowIds)

    expect(updatedWorkflows?.map((workflow) => workflow.id)).toEqual([
      employeeWorkflows[0].id,
      employeeWorkflows[1].id,
    ])
    expect(employeeWorkflows[0].used_count).toBe(
      countEmployeeWorkflowLinks(employeeWorkflows[0].id)
    )
  })

  test('rejects project workflows for AI employees', () => {
    const projectWorkflow = workflows.find((workflow) => workflow.type === 'project')!

    expect(updateAiEmployeeWorkflows(employee.id, [projectWorkflow.id])).toBeNull()
  })
})

describe('project workflow AI node configs', () => {
  test('stores project-level token without reading it back in plain text', () => {
    const target = projects
      .map((project) => ({
        project,
        workflow: getProjectWorkflows(project.id).find((workflow) =>
          getWorkflowDetail(workflow.id)?.flow.nodes.some(
            (node) => node.data.kind === 'ai_employee'
          )
        ),
      }))
      .find((item) => item.workflow)

    expect(target?.workflow).toBeTruthy()

    const workflow = target!.workflow!
    const configs = getProjectWorkflowAiNodeConfigs(target!.project.id, workflow.id)
    const config = configs?.[0]

    expect(config).toBeTruthy()

    const updatedConfigs = updateProjectWorkflowAiNodeConfig(
      target!.project.id,
      workflow.id,
      config!.node_id,
      {
        ai_employee_id: employee.id,
        employee_workflow_id: originalEmployeeWorkflowIds[0] ?? null,
        code_provider: 'github',
        repository_url: 'https://github.com/example/repo',
        default_branch: 'main',
        token: 'ghp_mock_token_1234',
      }
    )
    const updatedConfig = updatedConfigs?.find((item) => item.node_id === config!.node_id)

    expect(updatedConfig?.has_token).toBe(true)
    expect(updatedConfig?.token_mask).toBe('****1234')
    expect(JSON.stringify(updatedConfig)).not.toContain('ghp_mock_token_1234')
  })
})

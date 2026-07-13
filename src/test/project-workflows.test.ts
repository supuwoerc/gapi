import {
  getProjectWorkflows,
  projectWorkflowLinks,
  projects,
  updateProjectWorkflows,
} from '@/mocks/data/projects'
import { workflows } from '@/mocks/data/workflows'
import { projectWorkflowIdsMutationSchema } from '@/schema/project/project'
import { afterEach, describe, expect, test } from 'vitest'

const project = projects[0]
const originalWorkflowIds = getProjectWorkflows(project.id).map((workflow) => workflow.id)

function countWorkflowLinks(workflowId: number) {
  return projectWorkflowLinks.filter((link) => link.workflow_id === workflowId).length
}

afterEach(() => {
  updateProjectWorkflows(project.id, originalWorkflowIds)
})

describe('projectWorkflowIdsMutationSchema', () => {
  test('allows empty workflow id arrays', () => {
    expect(projectWorkflowIdsMutationSchema.parse({ workflow_ids: [] })).toEqual({
      workflow_ids: [],
    })
  })

  test('coerces string ids and removes duplicates', () => {
    expect(
      projectWorkflowIdsMutationSchema.parse({
        workflow_ids: ['2001', 2002, '2001'],
      })
    ).toEqual({
      workflow_ids: [2001, 2002],
    })
  })
})

describe('project workflow mock data', () => {
  test('updates project workflow links and synchronizes workflow used counts', () => {
    const nextWorkflowIds = [workflows[0].id, workflows[1].id, workflows[0].id]

    const updatedWorkflows = updateProjectWorkflows(project.id, nextWorkflowIds)

    expect(updatedWorkflows?.map((workflow) => workflow.id)).toEqual([
      workflows[0].id,
      workflows[1].id,
    ])
    expect(workflows[0].used_count).toBe(countWorkflowLinks(workflows[0].id))
    expect(workflows[1].used_count).toBe(countWorkflowLinks(workflows[1].id))
  })

  test('can clear all project workflow links', () => {
    const updatedWorkflows = updateProjectWorkflows(project.id, [])

    expect(updatedWorkflows).toEqual([])
    expect(getProjectWorkflows(project.id)).toEqual([])
  })

  test('rejects employee workflows for projects', () => {
    const employeeWorkflow = workflows.find((workflow) => workflow.type === 'employee')!

    expect(updateProjectWorkflows(project.id, [employeeWorkflow.id])).toBeNull()
  })
})

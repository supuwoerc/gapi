import type * as React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ProjectWorkflowSettings } from '@/feature/authenticated/projects/components/project-workflow-settings'
import type { Workflow } from '@/schema/workflow/workflow'
import { getWorkflows } from '@/service/workflows/workflows'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const value =
        {
          'settings.workflows.title': 'Workflow configuration',
          'settings.workflows.description': 'Choose project workflows.',
          'settings.workflows.configuredTitle': 'Configured workflows',
          'settings.workflows.configuredCount': '{{count}} workflow(s) configured',
          'settings.workflows.searchTitle': 'Add workflows',
          'settings.workflows.searchDescription': 'Search remote workflows.',
          'settings.workflows.searchPlaceholder': 'Search workflows',
          'settings.workflows.emptyOptions': 'No matching workflows',
          'settings.workflows.emptySelectedTitle': 'No linked workflows',
          'settings.workflows.emptySelected': 'No workflows are linked to this project.',
          'settings.workflows.reset': 'Reset',
          'settings.workflows.save': 'Save workflows',
          'settings.workflows.saving': 'Saving...',
          'settings.workflows.add': 'Add',
          'settings.workflows.added': 'Added',
          'settings.workflows.removeWorkflow': 'Remove {{name}}',
        }[key] ?? key

      return Object.entries(options ?? {}).reduce(
        (message, [optionKey, optionValue]) =>
          message.replace(`{{${optionKey}}}`, String(optionValue)),
        value
      )
    },
  }),
}))

vi.mock('@/service/workflows/workflows', () => ({
  getWorkflows: vi.fn(),
}))

const workflowA: Workflow = {
  id: 2000,
  name: 'API Review',
  description: 'Review API contracts before delivery.',
  type: 'project',
  used_count: 1,
  creator: {
    id: 1,
    name: 'Owner',
    email: 'owner@example.com',
    avatar: '',
  },
  created_at: new Date('2026-06-01T00:00:00.000Z'),
  updated_at: new Date('2026-06-01T00:00:00.000Z'),
}

const workflowB: Workflow = {
  ...workflowA,
  id: 2001,
  name: 'Bug Triage',
  description: 'Classify and route issues.',
}

function renderProjectWorkflowSettings(
  props?: Partial<React.ComponentProps<typeof ProjectWorkflowSettings>>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const onSave = vi.fn()

  vi.mocked(getWorkflows).mockResolvedValue({
    data: [workflowA, workflowB],
    total: 2,
  })

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ProjectWorkflowSettings
        workflows={[workflowA]}
        isFetching={false}
        isSaving={false}
        onSave={onSave}
        {...props}
      />
    </QueryClientProvider>
  )

  return { ...result, onSave }
}

describe('ProjectWorkflowSettings', () => {
  test('renders linked workflows without save actions when unchanged', () => {
    renderProjectWorkflowSettings()

    expect(screen.getByText('API Review')).toBeTruthy()
    expect(screen.getByText('1 workflow(s) configured')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Save workflows' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull()
  })

  test('renders configured workflows as static rows', () => {
    renderProjectWorkflowSettings()

    expect(screen.getByText('Review API contracts before delivery.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Remove API Review' })).toBeTruthy()
  })

  test('adds a remote search result and saves the selected ids', async () => {
    const { onSave } = renderProjectWorkflowSettings()

    expect(await screen.findByText('Bug Triage')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save workflows' }))

    expect(onSave).toHaveBeenCalledWith([2000, 2001])
  })
})

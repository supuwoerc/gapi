import type { Document } from '@/schema/document/document'

import { projects } from './projects'
import { users } from './users'

const now = '2026-06-01T08:00:00.000Z'

const titles = [
  'API Design Guidelines',
  'Project Architecture Overview',
  'Development Workflow',
  'Code Review Standards',
  'Deployment Runbook',
  'Database Schema Documentation',
  'Authentication Flow',
  'Error Handling Strategy',
  'Performance Optimization Notes',
  'Frontend Component Library',
  'Backend Service Contracts',
  'Testing Best Practices',
  'Security Audit Report',
  'Release Notes v2.0',
  'Onboarding Guide',
]

function buildDocuments(): Document[] {
  const visibilities = ['public', 'private', 'project'] as const
  let nextId = 1

  return titles.map((title, index) => {
    const project = projects[index % projects.length]
    const user = users[index % users.length]
    const visibility = visibilities[index % visibilities.length]
    const daysAgo = index * 3
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)

    return {
      id: nextId++,
      title,
      description: `Documentation for ${title.toLowerCase()}`,
      visibility,
      project: { id: project.id, name: project.name, logo: project.logo },
      owner: { id: user.id, username: user.username, avatar: user.avatar },
      created_at: createdAt,
      updated_at: createdAt,
    }
  })
}

export const documents: Document[] = buildDocuments()

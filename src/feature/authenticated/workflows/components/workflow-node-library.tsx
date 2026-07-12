'use no memo'

import type { WorkflowNodeKind } from '@/schema/workflow/workflow'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

import { WorkflowNodeKinds, workflowNodeKindIconMap } from './workflow-node-metadata'

interface WorkflowNodeLibraryProps {
  hasStartNode: boolean
  className?: string
  onAddNode: (kind: WorkflowNodeKind) => void
}

export function WorkflowNodeLibrary({
  hasStartNode,
  className,
  onAddNode,
}: WorkflowNodeLibraryProps) {
  const { t } = useTranslation('workflows')

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-lg border bg-background',
        className
      )}
    >
      <div className="border-b px-3 py-3">
        <h3 className="text-sm font-semibold">{t('editor.nodeLibrary')}</h3>
      </div>
      <div className="grid gap-2 overflow-y-auto p-2">
        {WorkflowNodeKinds.map((kind) => {
          const Icon = workflowNodeKindIconMap[kind]
          const disabled = kind === 'start' && hasStartNode

          return (
            <Button
              key={kind}
              type="button"
              variant="ghost"
              disabled={disabled}
              className="h-auto justify-start gap-2 rounded-md border border-transparent p-2 text-left hover:border-border"
              onClick={() => onAddNode(kind)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {t(`editor.nodeKinds.${kind}`)}
                </span>
                <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {t(`editor.nodeKindDescriptions.${kind}`)}
                </span>
              </span>
              <Plus className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          )
        })}
      </div>
    </aside>
  )
}

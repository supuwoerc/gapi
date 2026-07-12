'use no memo'

import type { WorkflowNodeKind, WorkflowNodeStatus } from '@/schema/workflow/workflow'
import type { Node, NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'

import { cn } from '@/lib/utils'

import { workflowNodeKindIconMap } from './workflow-node-metadata'

export interface WorkflowDesignNodeData extends Record<string, unknown> {
  title: string
  description: string
  kind: WorkflowNodeKind
  status: WorkflowNodeStatus
}

export type WorkflowDesignNodeType = Node<WorkflowDesignNodeData, 'workflow'>

const statusClassMap: Record<WorkflowNodeStatus, string> = {
  done: 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100',
  active:
    'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100',
  pending: 'border-border bg-card text-card-foreground',
}

const iconClassMap: Record<WorkflowNodeStatus, string> = {
  done: 'bg-emerald-500 text-white',
  active: 'bg-sky-500 text-white',
  pending: 'bg-muted text-muted-foreground',
}

export function WorkflowDesignNode({
  data,
  selected,
  isConnectable,
}: NodeProps<WorkflowDesignNodeType>) {
  const Icon = workflowNodeKindIconMap[data.kind]

  return (
    <div
      className={cn(
        'relative w-56 rounded-lg border p-3 shadow-sm transition-[box-shadow,transform]',
        statusClassMap[data.status],
        selected && 'shadow-md ring-2 ring-ring/40'
      )}
    >
      {data.kind !== 'start' ? (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="size-2.5 border-background"
        />
      ) : null}
      <div className="flex min-w-0 items-start gap-2">
        <span
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md',
            iconClassMap[data.status]
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{data.title}</div>
          <div className="mt-1 line-clamp-2 text-xs leading-5 opacity-75">{data.description}</div>
        </div>
      </div>
      {data.kind !== 'end' ? (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="size-2.5 border-background"
        />
      ) : null}
    </div>
  )
}

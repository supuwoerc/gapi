'use no memo'

import * as React from 'react'

import type { WorkflowDetail, WorkflowFlowEdge } from '@/schema/workflow/workflow'
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type NodeTypes,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Eye, PencilLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { WorkflowDesignNode, type WorkflowDesignNodeType } from './workflow-design-node'

const nodeTypes = {
  workflow: WorkflowDesignNode,
} satisfies NodeTypes

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
  },
}

interface WorkflowDesignCardProps {
  workflow?: WorkflowDetail
  loading?: boolean
  canEdit?: boolean
}

export function WorkflowDesignCard({ workflow, loading, canEdit }: WorkflowDesignCardProps) {
  const { t } = useTranslation('workflows')
  const initialNodes = React.useMemo(
    () => workflow?.flow.nodes ?? [],
    [workflow?.flow.nodes]
  ) as WorkflowDesignNodeType[]
  const initialEdges = React.useMemo(
    () => workflow?.flow.edges.map(toReactFlowEdge) ?? [],
    [workflow?.flow.edges]
  )
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowDesignNodeType>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isEditing, setIsEditing] = React.useState(false)
  const isWorkflowEditing = !!canEdit && isEditing

  React.useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  React.useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleConnect = React.useCallback(
    (connection: Connection) => {
      if (!isWorkflowEditing) return
      setEdges((currentEdges) => addEdge({ ...connection, type: 'smoothstep' }, currentEdges))
    },
    [isWorkflowEditing, setEdges]
  )

  if (loading) {
    return (
      <Card className="gap-4 py-5">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[34rem] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!workflow) return null

  return (
    <Card className="min-w-0 gap-4 py-5">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>{t('detail.design.title')}</CardTitle>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {t('detail.design.nodeCount', {
              nodes: workflow.flow.nodes.length,
              edges: workflow.flow.edges.length,
            })}
          </p>
        </div>
        {canEdit ? (
          <Button
            variant={isWorkflowEditing ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => setIsEditing((current) => !current)}
          >
            {isWorkflowEditing ? <Eye /> : <PencilLine />}
            {isWorkflowEditing ? t('detail.design.viewMode') : t('detail.design.editMode')}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="h-[34rem] overflow-hidden rounded-lg border bg-muted/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            nodesDraggable={isWorkflowEditing}
            nodesConnectable={isWorkflowEditing}
            elementsSelectable={isWorkflowEditing}
            edgesFocusable={isWorkflowEditing}
            nodesFocusable={isWorkflowEditing}
            onNodesChange={isWorkflowEditing ? onNodesChange : undefined}
            onEdgesChange={isWorkflowEditing ? onEdgesChange : undefined}
            onConnect={isWorkflowEditing ? handleConnect : undefined}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={18} size={1} />
            <MiniMap
              pannable
              zoomable
              position="bottom-right"
              nodeStrokeWidth={2}
              className="hidden overflow-hidden rounded-md border bg-background shadow-sm md:block"
            />
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  )
}

function toReactFlowEdge(edge: WorkflowFlowEdge): Edge {
  return {
    ...edge,
    type: edge.type ?? 'smoothstep',
    animated: edge.animated ?? false,
  }
}

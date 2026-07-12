'use no memo'

import * as React from 'react'

import type { WorkflowFlow, WorkflowFlowEdge } from '@/schema/workflow/workflow'
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type Node,
  type NodeChange,
  type NodeTypes,
  ReactFlow,
  addEdge,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTranslation } from 'react-i18next'

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

const miniMapNodeColor = (node: Node) => {
  const status = (node.data as Partial<WorkflowDesignNodeType['data']>).status

  switch (status) {
    case 'done':
      return '#34d399'
    case 'active':
      return '#38bdf8'
    default:
      return '#cbd5e1'
  }
}

const miniMapNodeStrokeColor = (node: Node) => {
  const status = (node.data as Partial<WorkflowDesignNodeType['data']>).status

  switch (status) {
    case 'done':
      return '#047857'
    case 'active':
      return '#0369a1'
    default:
      return '#64748b'
  }
}

const DraftWorkflowFlow: WorkflowFlow = {
  nodes: [
    {
      id: 'draft-start',
      type: 'workflow',
      position: { x: 0, y: 90 },
      data: {
        title: 'Start',
        description: 'Workflow starts here.',
        kind: 'start',
        status: 'active',
      },
    },
    {
      id: 'draft-end',
      type: 'workflow',
      position: { x: 360, y: 90 },
      data: {
        title: 'Complete',
        description: 'Workflow reaches a final outcome.',
        kind: 'end',
        status: 'pending',
      },
    },
  ],
  edges: [
    {
      id: 'draft-start-end',
      source: 'draft-start',
      target: 'draft-end',
      type: 'smoothstep',
    },
  ],
}

interface WorkflowDesignCardProps {
  flow?: WorkflowFlow
  loading?: boolean
  editable?: boolean
}

export function WorkflowDesignCard({ flow, loading, editable }: WorkflowDesignCardProps) {
  const { t } = useTranslation('workflows')
  const workflowFlow = flow ?? DraftWorkflowFlow
  const initialNodes = React.useMemo(
    () => workflowFlow.nodes,
    [workflowFlow.nodes]
  ) as WorkflowDesignNodeType[]
  const initialEdges = React.useMemo(
    () => workflowFlow.edges.map(toReactFlowEdge),
    [workflowFlow.edges]
  )
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowDesignNodeType>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  React.useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  React.useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleConnect = React.useCallback(
    (connection: Connection) => {
      if (!editable) return
      setEdges((currentEdges) => addEdge({ ...connection, type: 'smoothstep' }, currentEdges))
    },
    [editable, setEdges]
  )

  const handleNodesChange = React.useCallback(
    (changes: NodeChange<WorkflowDesignNodeType>[]) => {
      if (editable) {
        onNodesChange(changes)
        return
      }

      const dimensionChanges = changes.filter((change) => change.type === 'dimensions')
      if (!dimensionChanges.length) return

      setNodes((currentNodes) => applyNodeChanges(dimensionChanges, currentNodes))
    },
    [editable, onNodesChange, setNodes]
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

  return (
    <Card className="min-w-0 gap-4 py-5">
      <CardHeader>
        <CardTitle>{t('createPage.design')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('createPage.designDescription')}</p>
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
            nodesDraggable={editable}
            nodesConnectable={editable}
            elementsSelectable={editable}
            edgesFocusable={editable}
            nodesFocusable={editable}
            onNodesChange={handleNodesChange}
            onEdgesChange={editable ? onEdgesChange : undefined}
            onConnect={editable ? handleConnect : undefined}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={18} size={1} />
            <MiniMap
              pannable
              zoomable
              position="bottom-right"
              nodeColor={miniMapNodeColor}
              nodeStrokeColor={miniMapNodeStrokeColor}
              nodeBorderRadius={8}
              nodeStrokeWidth={2}
              maskColor="rgb(15 23 42 / 0.08)"
              maskStrokeColor="#94a3b8"
              className="hidden overflow-hidden rounded-md border bg-background shadow-sm md:block"
            />
            <Controls showInteractive={editable} position="bottom-left" />
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

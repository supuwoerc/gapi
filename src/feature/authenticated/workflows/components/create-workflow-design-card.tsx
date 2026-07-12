'use no memo'

import * as React from 'react'

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
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { WorkflowDesignNode, type WorkflowDesignNodeType } from './workflow-design-node'

const nodeTypes = {
  workflow: WorkflowDesignNode,
} satisfies NodeTypes

const initialNodes: WorkflowDesignNodeType[] = [
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
]

const initialEdges: Edge[] = [
  {
    id: 'draft-start-end',
    source: 'draft-start',
    target: 'draft-end',
    type: 'smoothstep',
  },
]

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
  },
}

export function CreateWorkflowDesignCard() {
  const { t } = useTranslation('workflows')
  const [nodes, , onNodesChange] = useNodesState<WorkflowDesignNodeType>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const handleConnect = React.useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) => addEdge({ ...connection, type: 'smoothstep' }, currentEdges))
    },
    [setEdges]
  )

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
            nodesDraggable
            nodesConnectable
            elementsSelectable
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
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
            <Controls position="bottom-left" />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  )
}

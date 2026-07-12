'use no memo'

import * as React from 'react'

import type {
  WorkflowFlow,
  WorkflowFlowEdge,
  WorkflowFlowNode,
  WorkflowNodeKind,
} from '@/schema/workflow/workflow'
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MarkerType,
  MiniMap,
  type Node,
  type NodeChange,
  type NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ListPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

import {
  WorkflowDesignNode,
  type WorkflowDesignNodeData,
  type WorkflowDesignNodeType,
} from './workflow-design-node'
import { WorkflowNodeConfigPanel } from './workflow-node-config-panel'
import { WorkflowNodeLibrary } from './workflow-node-library'

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

interface NodeLibraryContextMenu {
  x: number
  y: number
  position: { x: number; y: number }
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

export const DraftWorkflowFlow: WorkflowFlow = {
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
  onFlowChange?: (flow: WorkflowFlow) => void
}

export function WorkflowDesignCard({
  flow,
  loading,
  editable,
  onFlowChange,
}: WorkflowDesignCardProps) {
  const { t } = useTranslation('workflows')
  const workflowFlow = flow ?? DraftWorkflowFlow

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
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>{t('createPage.design')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('createPage.designDescription')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <ReactFlowProvider>
          <WorkflowDesignSurface
            key={getWorkflowFlowKey(workflowFlow)}
            flow={workflowFlow}
            editable={!!editable}
            onFlowChange={onFlowChange}
          />
        </ReactFlowProvider>
      </CardContent>
    </Card>
  )
}

function WorkflowDesignSurface({
  flow,
  editable,
  onFlowChange,
}: {
  flow: WorkflowFlow
  editable: boolean
  onFlowChange?: (flow: WorkflowFlow) => void
}) {
  const { t } = useTranslation('workflows')
  const { screenToFlowPosition } = useReactFlow()
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [nodeLibraryOpen, setNodeLibraryOpen] = React.useState(false)
  const [configOpen, setConfigOpen] = React.useState(false)
  const [contextMenu, setContextMenu] = React.useState<NodeLibraryContextMenu>()
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>()
  const initialNodes = React.useMemo(() => flow.nodes.map(toReactFlowNode), [flow.nodes])
  const initialEdges = React.useMemo(() => flow.edges.map(toReactFlowEdge), [flow.edges])
  const [nodes, setNodes] = React.useState<WorkflowDesignNodeType[]>(initialNodes)
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges)
  const selectedNode = nodes.find((node) => node.id === selectedNodeId)
  const hasStartNode = nodes.some((node) => node.data.kind === 'start')

  React.useEffect(() => {
    onFlowChange?.(toWorkflowFlow(nodes, edges))
  }, [edges, nodes, onFlowChange])

  const getViewportCenterPosition = React.useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect()

    if (!rect) {
      return { x: 0, y: 0 }
    }

    return screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }, [screenToFlowPosition])

  const handleAddNode = React.useCallback(
    (kind: WorkflowNodeKind, position?: { x: number; y: number }) => {
      if (kind === 'start' && hasStartNode) return

      const nodeId = `workflow-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const node: WorkflowDesignNodeType = {
        id: nodeId,
        type: 'workflow',
        position: position ?? getViewportCenterPosition(),
        selected: true,
        data: {
          title: t(`editor.nodeKinds.${kind}`),
          description: t(`editor.defaultNodeDescriptions.${kind}`),
          kind,
          status: 'pending',
        },
      }

      setNodes((currentNodes) => [
        ...currentNodes.map((currentNode) => ({ ...currentNode, selected: false })),
        node,
      ])
      setSelectedNodeId(nodeId)
      setNodeLibraryOpen(false)
      setContextMenu(undefined)
      setConfigOpen(true)
    },
    [getViewportCenterPosition, hasStartNode, t]
  )

  const handleNodesChange = React.useCallback(
    (changes: NodeChange<WorkflowDesignNodeType>[]) => {
      if (!editable) {
        const dimensionChanges = changes.filter((change) => change.type === 'dimensions')
        if (!dimensionChanges.length) return

        setNodes((currentNodes) => applyNodeChanges(dimensionChanges, currentNodes))
        return
      }

      const selectedChange = changes.find((change) => change.type === 'select' && change.selected)
      const hasOnlyUnselectChanges =
        changes.length > 0 &&
        changes.every((change) => change.type === 'select' && !change.selected)

      if (selectedChange?.type === 'select') {
        setSelectedNodeId(selectedChange.id)
        setContextMenu(undefined)
        setConfigOpen(true)
      } else if (hasOnlyUnselectChanges) {
        setSelectedNodeId(undefined)
        setConfigOpen(false)
      }

      setNodes((currentNodes) => {
        const allowedChanges = changes.filter((change) => {
          if (change.type !== 'remove') return true

          const node = currentNodes.find((currentNode) => currentNode.id === change.id)
          return node?.data.kind !== 'start'
        })

        return applyNodeChanges(allowedChanges, currentNodes)
      })
    },
    [editable]
  )

  const handleEdgesChange = React.useCallback(
    (changes: EdgeChange<Edge>[]) => {
      if (!editable) return
      setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
    },
    [editable]
  )

  const handleConnect = React.useCallback(
    (connection: Connection) => {
      if (!editable || !connection.source || !connection.target) return
      if (connection.source === connection.target) return

      setEdges((currentEdges) => {
        const exists = currentEdges.some(
          (edge) => edge.source === connection.source && edge.target === connection.target
        )
        if (exists) return currentEdges

        return addEdge(
          {
            ...connection,
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            type: 'smoothstep',
          },
          currentEdges
        )
      })
    },
    [editable]
  )

  const handleNodeDataChange = React.useCallback(
    (nodeId: string, data: Partial<WorkflowDesignNodeData>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== nodeId) return node
          if (node.data.kind === 'start' && data.kind && data.kind !== 'start') return node
          if (
            data.kind === 'start' &&
            currentNodes.some(
              (currentNode) => currentNode.id !== nodeId && currentNode.data.kind === 'start'
            )
          ) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          }
        })
      )

      if (data.kind === 'start') {
        setEdges((currentEdges) => currentEdges.filter((edge) => edge.target !== nodeId))
      }

      if (data.kind === 'end') {
        setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId))
      }
    },
    []
  )

  const handleDeleteNode = React.useCallback(
    (nodeId: string) => {
      const node = nodes.find((currentNode) => currentNode.id === nodeId)
      if (!node || node.data.kind === 'start') return

      setNodes((currentNodes) => currentNodes.filter((currentNode) => currentNode.id !== nodeId))
      setEdges((currentEdges) =>
        currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      )
      setSelectedNodeId(undefined)
      setContextMenu(undefined)
      setConfigOpen(false)
    },
    [nodes]
  )

  const panelProps = {
    selectedNode,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    editable,
    hasStartNode,
    onNodeDataChange: handleNodeDataChange,
    onDeleteNode: handleDeleteNode,
  }
  const handlePaneClick = React.useCallback(() => {
    setSelectedNodeId(undefined)
    setContextMenu(undefined)
    setConfigOpen(false)
  }, [])
  const handlePaneContextMenu = React.useCallback(
    (event: globalThis.MouseEvent | React.MouseEvent<Element, globalThis.MouseEvent>) => {
      if (!editable) return

      event.preventDefault()
      setSelectedNodeId(undefined)
      setConfigOpen(false)
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        position: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      })
    },
    [editable, screenToFlowPosition]
  )

  return (
    <>
      {editable ? (
        <Sheet modal={false} open={configOpen} onOpenChange={setConfigOpen}>
          <SheetContent
            side="right"
            showOverlay={false}
            className="w-[min(22rem,calc(100vw-2rem))] p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{t('editor.config')}</SheetTitle>
              <SheetDescription>{t('editor.config')}</SheetDescription>
            </SheetHeader>
            <WorkflowNodeConfigPanel className="h-full rounded-none border-0" {...panelProps} />
          </SheetContent>
        </Sheet>
      ) : null}

      {editable ? (
        <div className="mb-3 flex flex-wrap gap-2">
          <DropdownMenu open={nodeLibraryOpen} onOpenChange={setNodeLibraryOpen}>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                <ListPlus />
                {t('editor.nodeLibrary')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-0">
              <WorkflowNodeLibrary
                className="max-h-[24rem] rounded-md border-0 shadow-none"
                hasStartNode={hasStartNode}
                onAddNode={handleAddNode}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <div className="grid min-h-0 gap-3">
        <div
          ref={viewportRef}
          className="h-[34rem] min-w-0 overflow-hidden rounded-lg border bg-muted/20 lg:h-[calc(100svh-16rem)] lg:min-h-[34rem]"
        >
          {contextMenu ? (
            <div
              className="fixed z-40 w-72"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onContextMenu={(event) => event.preventDefault()}
            >
              <WorkflowNodeLibrary
                className="max-h-[24rem] rounded-md shadow-lg"
                hasStartNode={hasStartNode}
                onAddNode={(kind) => handleAddNode(kind, contextMenu.position)}
              />
            </div>
          ) : null}
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
            deleteKeyCode={null}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={
              editable
                ? (_event, node) => {
                    setSelectedNodeId(node.id)
                    setContextMenu(undefined)
                    setConfigOpen(true)
                  }
                : undefined
            }
            onPaneClick={editable ? handlePaneClick : undefined}
            onPaneContextMenu={handlePaneContextMenu}
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
      </div>
    </>
  )
}

function toReactFlowNode(node: WorkflowFlowNode): WorkflowDesignNodeType {
  return {
    id: node.id,
    type: 'workflow',
    position: { ...node.position },
    data: { ...node.data },
  }
}

function getWorkflowFlowKey(flow: WorkflowFlow) {
  return [
    flow.nodes
      .map((node) => `${node.id}:${node.position.x}:${node.position.y}:${node.data.kind}`)
      .join('|'),
    flow.edges.map((edge) => `${edge.id}:${edge.source}:${edge.target}`).join('|'),
  ].join('::')
}

function toReactFlowEdge(edge: WorkflowFlowEdge): Edge {
  return {
    ...edge,
    type: edge.type ?? 'smoothstep',
    animated: edge.animated ?? false,
  }
}

function toWorkflowFlow(nodes: WorkflowDesignNodeType[], edges: Edge[]): WorkflowFlow {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: 'workflow',
      position: { ...node.position },
      data: {
        title: node.data.title,
        description: node.data.description,
        kind: node.data.kind,
        status: node.data.status,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === 'string' ? edge.label : undefined,
      type: edge.type ?? 'smoothstep',
      animated: edge.animated ?? false,
    })),
  }
}

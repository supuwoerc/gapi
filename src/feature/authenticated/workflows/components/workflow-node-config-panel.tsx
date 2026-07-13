'use no memo'

import { useQuery } from '@tanstack/react-query'

import { getAiEmployeeWorkflows, getAiEmployees } from '@/service/ai-employees/ai-employees'
import { Settings2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import type { WorkflowDesignNodeData, WorkflowDesignNodeType } from './workflow-design-node'

interface WorkflowNodeConfigPanelProps {
  selectedNode?: WorkflowDesignNodeType
  nodeCount: number
  edgeCount: number
  editable: boolean
  className?: string
  onNodeDataChange: (nodeId: string, data: Partial<WorkflowDesignNodeData>) => void
  onDeleteNode: (nodeId: string) => void
}

export function WorkflowNodeConfigPanel({
  selectedNode,
  nodeCount,
  edgeCount,
  editable,
  className,
  onNodeDataChange,
  onDeleteNode,
}: WorkflowNodeConfigPanelProps) {
  const { t } = useTranslation('workflows')

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-lg border bg-background',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b px-3 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{t('editor.config')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('detail.design.nodeCount', { nodes: nodeCount, edges: edgeCount })}
          </p>
        </div>
        <Badge variant="outline">
          {editable ? t('detail.design.editMode') : t('detail.design.viewMode')}
        </Badge>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {selectedNode ? (
          <NodeForm
            node={selectedNode}
            editable={editable}
            onNodeDataChange={onNodeDataChange}
            onDeleteNode={onDeleteNode}
          />
        ) : (
          <WorkflowOverview nodeCount={nodeCount} edgeCount={edgeCount} />
        )}
      </div>
    </aside>
  )
}

function NodeForm({
  node,
  editable,
  onNodeDataChange,
  onDeleteNode,
}: {
  node: WorkflowDesignNodeType
  editable: boolean
  onNodeDataChange: WorkflowNodeConfigPanelProps['onNodeDataChange']
  onDeleteNode: WorkflowNodeConfigPanelProps['onDeleteNode']
}) {
  const { t } = useTranslation('workflows')
  const isStartNode = node.data.kind === 'start'
  const isAiEmployeeNode = node.data.kind === 'ai_employee'

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="workflow-node-title">{t('editor.nodeTitle')}</Label>
        <Input
          id="workflow-node-title"
          value={node.data.title}
          disabled={!editable}
          onChange={(event) => onNodeDataChange(node.id, { title: event.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="workflow-node-description">{t('editor.nodeDescription')}</Label>
        <Textarea
          id="workflow-node-description"
          className="min-h-24"
          value={node.data.description}
          disabled={!editable}
          onChange={(event) => onNodeDataChange(node.id, { description: event.target.value })}
        />
      </div>

      {isAiEmployeeNode ? (
        <AiEmployeeNodeConfig node={node} editable={editable} onNodeDataChange={onNodeDataChange} />
      ) : (
        <AdvancedConfig />
      )}

      <Button
        type="button"
        variant="destructive"
        disabled={!editable || isStartNode}
        onClick={() => onDeleteNode(node.id)}
      >
        <Trash2 />
        {t('editor.deleteNode')}
      </Button>
    </div>
  )
}

function AiEmployeeNodeConfig({
  node,
  editable,
  onNodeDataChange,
}: {
  node: WorkflowDesignNodeType
  editable: boolean
  onNodeDataChange: WorkflowNodeConfigPanelProps['onNodeDataChange']
}) {
  const { t } = useTranslation('workflows')
  const aiEmployeeId = node.data.ai_employee_id ?? null
  const employeeWorkflowId = node.data.employee_workflow_id ?? null

  const { data: aiEmployeesPage, isFetching: isAiEmployeesFetching } = useQuery({
    queryKey: ['ai-employees', 'workflow-node-options'],
    queryFn: () => getAiEmployees({ page: 1, perPage: 20, status: ['active'] }),
  })

  const { data: employeeWorkflows = [], isFetching: isEmployeeWorkflowsFetching } = useQuery({
    queryKey: ['ai-employee-workflows', aiEmployeeId],
    queryFn: () => getAiEmployeeWorkflows(aiEmployeeId!),
    enabled: aiEmployeeId !== null,
  })

  const aiEmployees = aiEmployeesPage?.data ?? []

  return (
    <div className="grid gap-3 rounded-md border border-dashed p-3">
      <div className="grid gap-1">
        <div className="text-sm font-medium">{t('editor.aiEmployeeConfig.title')}</div>
        <p className="text-xs text-muted-foreground">{t('editor.aiEmployeeConfig.description')}</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="workflow-node-ai-employee">{t('editor.aiEmployeeConfig.employee')}</Label>
        <Select
          value={aiEmployeeId === null ? 'none' : String(aiEmployeeId)}
          disabled={!editable || isAiEmployeesFetching}
          onValueChange={(value) => {
            onNodeDataChange(node.id, {
              ai_employee_id: value === 'none' ? null : Number(value),
              employee_workflow_id: null,
            })
          }}
        >
          <SelectTrigger id="workflow-node-ai-employee" className="w-full">
            <SelectValue placeholder={t('editor.aiEmployeeConfig.employeePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">{t('editor.aiEmployeeConfig.none')}</SelectItem>
              {aiEmployees.map((employee) => (
                <SelectItem key={employee.id} value={String(employee.id)}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="workflow-node-employee-workflow">
          {t('editor.aiEmployeeConfig.employeeWorkflow')}
        </Label>
        <Select
          value={employeeWorkflowId === null ? 'none' : String(employeeWorkflowId)}
          disabled={!editable || aiEmployeeId === null || isEmployeeWorkflowsFetching}
          onValueChange={(value) => {
            onNodeDataChange(node.id, {
              employee_workflow_id: value === 'none' ? null : Number(value),
            })
          }}
        >
          <SelectTrigger id="workflow-node-employee-workflow" className="w-full">
            <SelectValue placeholder={t('editor.aiEmployeeConfig.employeeWorkflowPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">{t('editor.aiEmployeeConfig.none')}</SelectItem>
              {employeeWorkflows.map((workflow) => (
                <SelectItem key={workflow.id} value={String(workflow.id)}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function WorkflowOverview({ nodeCount, edgeCount }: { nodeCount: number; edgeCount: number }) {
  const { t } = useTranslation('workflows')

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('editor.nodes')} value={nodeCount} />
        <Stat label={t('editor.edges')} value={edgeCount} />
      </div>
      <AdvancedConfig />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function AdvancedConfig() {
  const { t } = useTranslation('workflows')

  return (
    <div className="rounded-md border border-dashed p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Settings2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{t('editor.advancedConfig')}</span>
        </div>
        <Badge variant="secondary">{t('editor.soon')}</Badge>
      </div>
    </div>
  )
}

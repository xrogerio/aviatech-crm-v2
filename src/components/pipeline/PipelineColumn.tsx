import { Project, ProjectStatus } from '@/services/projectsService'
import { PipelineCard } from '@/components/pipeline/PipelineCard'

interface PipelineColumnProps {
  title: string
  status: ProjectStatus
  projects: Project[]
  onUpdateStatus: (id: string, status: ProjectStatus) => void
}

export function PipelineColumn({
  title,
  status,
  projects,
  onUpdateStatus,
}: PipelineColumnProps) {
  const getColumnColor = (status: string) => {
    switch (status) {
      case 'Novo Projeto':
        return 'border-slate-200 bg-slate-50/50 dark:bg-slate-900/20'
      case 'Qualificação':
        return 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/20'
      case 'Proposta Enviada':
        return 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/20'
      case 'Negociação':
        return 'border-purple-200 bg-purple-50/50 dark:bg-purple-900/20'
      case 'Fechado':
        return 'border-green-200 bg-green-50/50 dark:bg-green-900/20'
      case 'Negado':
        return 'border-red-200 bg-red-50/50 dark:bg-red-900/20'
      default:
        return 'border-border bg-muted/50'
    }
  }

  return (
    <div
      className={`flex w-80 shrink-0 flex-col rounded-xl border ${getColumnColor(status)}`}
    >
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-medium shadow-sm">
          {projects.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {projects.map((project) => (
          <PipelineCard
            key={project.id}
            project={project}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
        {projects.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 bg-background/50 p-4 text-center text-sm text-muted-foreground">
            Nenhum projeto
          </div>
        )}
      </div>
    </div>
  )
}

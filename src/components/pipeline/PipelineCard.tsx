import { Project, ProjectStatus } from '@/services/projectsService'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Calendar, Building2 } from 'lucide-react'
import { format } from 'date-fns'

interface PipelineCardProps {
  project: Project
  onUpdateStatus: (id: string, status: ProjectStatus) => void
}

const PIPELINE_STAGES: ProjectStatus[] = [
  'Novo Projeto',
  'Qualificação',
  'Proposta Enviada',
  'Negociação',
  'Fechado',
  'Negado',
]

export function PipelineCard({ project, onUpdateStatus }: PipelineCardProps) {
  return (
    <Card className="cursor-pointer shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">{project.name}</h4>
            <div className="flex items-center text-sm text-muted-foreground pt-1">
              <Building2 className="mr-1 h-3 w-3" />
              {project.leads?.empresa || 'Sem lead'}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mover para</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PIPELINE_STAGES.filter((s) => s !== project.status).map(
                (stage) => (
                  <DropdownMenuItem
                    key={stage}
                    onClick={() => onUpdateStatus(project.id, stage)}
                  >
                    {stage}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.classification && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs font-normal">
              {project.classification}
            </Badge>
          </div>
        )}

        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          {format(new Date(project.created_at), 'dd/MM/yyyy')}
        </div>
      </CardContent>
    </Card>
  )
}

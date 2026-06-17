import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Project } from '@/services/projectsService'
import { Task, tasksService } from '@/services/tasksService'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, CheckCircle, Circle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ProjectTimelineSheetProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectTimelineSheet({
  project,
  open,
  onOpenChange,
}: ProjectTimelineSheetProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && project) {
      setLoading(true)
      tasksService.getTasksByProject(project.id).then((data) => {
        setTasks(data)
        setLoading(false)
      })
    }
  }, [open, project])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Linha do Tempo: {project?.name}</SheetTitle>
          <SheetDescription>
            Tarefas relacionadas a este projeto
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-8">
              Nenhuma tarefa encontrada para este projeto.
            </p>
          ) : (
            <div className="relative border-l-2 border-muted ml-3 space-y-6 mt-4">
              {tasks.map((task) => (
                <div key={task.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 bg-background rounded-full">
                    {task.status === 'concluida' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-semibold">{task.titulo}</h4>
                    {task.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.descricao}
                      </p>
                    )}
                    {task.prazo && (
                      <span className="text-xs text-muted-foreground flex items-center mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(
                          new Date(task.prazo),
                          "dd 'de' MMM 'às' HH:mm",
                          { locale: ptBR },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

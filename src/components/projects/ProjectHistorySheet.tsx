import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Project } from '@/services/projectsService'
import { Task, tasksService } from '@/services/tasksService'
import {
  Interaction,
  interactionsService,
} from '@/services/interactionsService'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, CheckCircle, MessageSquare, CalendarClock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ProjectHistorySheetProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TimelineItem =
  | { type: 'interaction'; data: Interaction; date: Date }
  | { type: 'task'; data: Task; date: Date }

export function ProjectHistorySheet({
  project,
  open,
  onOpenChange,
}: ProjectHistorySheetProps) {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && project) {
      setLoading(true)
      Promise.all([
        tasksService.getTasksByProject(project.id),
        interactionsService.getInteractionsByProject(project.id),
      ]).then(([tasks, interactions]) => {
        const taskItems: TimelineItem[] = tasks.map((t) => ({
          type: 'task',
          data: t,
          date: t.prazo ? new Date(t.prazo) : new Date(0),
        }))
        const interactionItems: TimelineItem[] = interactions.map((i) => ({
          type: 'interaction',
          data: i,
          date: new Date(i.data),
        }))

        const merged = [...taskItems, ...interactionItems].sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        )
        setItems(merged)
        setLoading(false)
      })
    }
  }, [open, project])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Histórico: {project?.name}</SheetTitle>
          <SheetDescription>
            Interações e tarefas relacionadas a este projeto
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-8">
              Nenhum histórico encontrado para este projeto.
            </p>
          ) : (
            <div className="relative border-l-2 border-muted ml-3 space-y-6 mt-4">
              {items.map((item, index) => (
                <div key={index} className="relative pl-6">
                  {item.type === 'task' ? (
                    <div className="absolute -left-[9px] top-1 bg-background rounded-full">
                      {item.data.status === 'concluida' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <CalendarClock className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  ) : (
                    <div className="absolute -left-[9px] top-1 bg-background rounded-full">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                    </div>
                  )}

                  <div className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    {item.type === 'task' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-medium">
                              Tarefa
                            </span>
                            {item.data.titulo}
                          </h4>
                        </div>
                        {item.data.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.data.descricao}
                          </p>
                        )}
                        {item.data.prazo && (
                          <span className="text-xs text-muted-foreground flex items-center mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Prazo:{' '}
                            {format(item.date, "dd 'de' MMM 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Status:{' '}
                          {item.data.status === 'concluida'
                            ? 'Concluída'
                            : 'Pendente'}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-medium">
                              Interação
                            </span>
                            {item.data.tipo}
                          </h4>
                        </div>
                        {item.data.descricao && (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                            {item.data.descricao}
                          </p>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(item.date, "dd 'de' MMM 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                        {item.data.user && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Por: {item.data.user.name || 'Usuário'}
                          </p>
                        )}
                      </>
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

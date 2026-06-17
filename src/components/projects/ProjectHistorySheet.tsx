import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Project } from '@/services/projectsService'
import { Task, tasksService, CreateTaskDTO } from '@/services/tasksService'
import {
  Interaction,
  interactionsService,
} from '@/services/interactionsService'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Clock,
  CheckCircle,
  MessageSquare,
  CalendarClock,
  Edit,
  Trash,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { InteractionFormDialog } from '@/components/leads/InteractionFormDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskForm } from '@/components/tasks/TaskForm'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ProjectHistorySheetProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectHistorySheet({
  project,
  open,
  onOpenChange,
}: ProjectHistorySheetProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [editingInteraction, setEditingInteraction] =
    useState<Interaction | null>(null)
  const [deletingInteraction, setDeletingInteraction] =
    useState<Interaction | null>(null)

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const [creatingTask, setCreatingTask] = useState(false)
  const [creatingInteraction, setCreatingInteraction] = useState(false)

  const fetchData = async () => {
    if (!project) return
    setLoading(true)
    try {
      const [fetchedTasks, fetchedInteractions] = await Promise.all([
        tasksService.getTasksByProject(project.id),
        interactionsService.getInteractionsByProject(project.id),
      ])
      setTasks(fetchedTasks)
      setInteractions(fetchedInteractions)
    } catch (error) {
      toast({ title: 'Erro ao carregar histórico', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && project) {
      fetchData()
    } else {
      setTasks([])
      setInteractions([])
    }
  }, [open, project])

  const handleDeleteInteraction = async () => {
    if (!deletingInteraction) return
    try {
      await interactionsService.deleteInteraction(deletingInteraction.id)
      toast({ title: 'Interação removida com sucesso' })
      setInteractions(
        interactions.filter((i) => i.id !== deletingInteraction.id),
      )
    } catch (error) {
      toast({ title: 'Erro ao remover interação', variant: 'destructive' })
    } finally {
      setDeletingInteraction(null)
    }
  }

  const handleDeleteTask = async () => {
    if (!deletingTask) return
    try {
      await tasksService.deleteTask(deletingTask.id)
      toast({ title: 'Tarefa removida com sucesso' })
      setTasks(tasks.filter((t) => t.id !== deletingTask.id))
    } catch (error) {
      toast({ title: 'Erro ao remover tarefa', variant: 'destructive' })
    } finally {
      setDeletingTask(null)
    }
  }

  const handleUpdateTask = async (data: CreateTaskDTO) => {
    if (!editingTask) return
    try {
      await tasksService.updateTask(editingTask.id, {
        titulo: data.titulo,
        descricao: data.descricao,
        prazo: data.prazo,
        status: data.status,
      })
      toast({ title: 'Tarefa atualizada com sucesso' })
      setEditingTask(null)
      fetchData()
    } catch (error) {
      toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' })
    }
  }

  const handleCreateTask = async (data: CreateTaskDTO) => {
    try {
      await tasksService.createTask(data)
      toast({ title: 'Tarefa criada com sucesso' })
      setCreatingTask(false)
      fetchData()
    } catch (error) {
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Histórico: {project?.name}</SheetTitle>
          <SheetDescription>
            Interações e tarefas relacionadas a este projeto
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="interactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="interactions">Interações</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            </TabsList>

            <TabsContent value="interactions" className="space-y-4 mt-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setCreatingInteraction(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nova Interação
                </Button>
              </div>
              {loading ? (
                <div className="space-y-4 mt-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-8">
                  Nenhuma interação encontrada.
                </p>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="bg-card border rounded-lg p-4 shadow-sm relative group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-purple-500" />
                          {interaction.tipo}
                        </h4>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 absolute right-2 top-2 bg-card rounded-md shadow-sm border p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditingInteraction(interaction)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingInteraction(interaction)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {interaction.descricao && (
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                          {interaction.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(
                            new Date(interaction.data),
                            "dd 'de' MMM 'às' HH:mm",
                            { locale: ptBR },
                          )}
                        </span>
                        {interaction.user && (
                          <span className="text-xs text-muted-foreground">
                            Por: {interaction.user?.name || 'Usuário'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-4">
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setCreatingTask(true)}>
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>
              {loading ? (
                <div className="space-y-4 mt-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-8">
                  Nenhuma tarefa encontrada.
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-card border rounded-lg p-4 shadow-sm relative group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2 pr-16">
                          {task.status === 'Concluída' ||
                          task.status === 'concluida' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <CalendarClock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{task.titulo}</span>
                        </h4>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 absolute right-2 top-2 bg-card rounded-md shadow-sm border p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingTask(task)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {task.descricao && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {task.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        {task.prazo && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Prazo:{' '}
                            {format(
                              new Date(task.prazo),
                              "dd 'de' MMM 'às' HH:mm",
                              { locale: ptBR },
                            )}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Status:{' '}
                          {task.status === 'concluida'
                            ? 'Concluída'
                            : task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      <InteractionFormDialog
        leadId={project?.lead_id || 'unassigned'}
        projectId={project?.id}
        interaction={editingInteraction}
        open={!!editingInteraction || creatingInteraction}
        onOpenChange={(open) => {
          if (!open) {
            setEditingInteraction(null)
            setCreatingInteraction(false)
          }
        }}
        onSuccess={fetchData}
      />

      <Dialog
        open={!!editingTask || creatingTask}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null)
            setCreatingTask(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
          </DialogHeader>
          {(editingTask || creatingTask) && (
            <TaskForm
              projectId={project?.id || editingTask?.project_id || undefined}
              leadId={editingTask?.lead_id || project?.lead_id || 'unassigned'}
              defaultValues={
                editingTask
                  ? {
                      titulo: editingTask.titulo,
                      descricao: editingTask.descricao || '',
                      status:
                        editingTask.status === 'concluida'
                          ? 'Concluída'
                          : editingTask.status || 'Pendente',
                      prazo: editingTask.prazo
                        ? new Date(editingTask.prazo)
                        : new Date(),
                      leadId:
                        editingTask.lead_id || project?.lead_id || 'unassigned',
                      projectId:
                        editingTask.project_id || project?.id || undefined,
                    }
                  : {
                      leadId: project?.lead_id || 'unassigned',
                      projectId: project?.id || undefined,
                    }
              }
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setEditingTask(null)
                setCreatingTask(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingInteraction}
        onOpenChange={(open) => !open && setDeletingInteraction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover interação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A interação será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInteraction}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa será permanentemente
              removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}

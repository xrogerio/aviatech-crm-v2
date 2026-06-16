import { useEffect, useState } from 'react'
import { Lead } from '@/context/LeadsContext'
import { Task, tasksService } from '@/services/tasksService'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TaskForm } from '@/components/tasks/TaskForm'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
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

interface LeadTasksSectionProps {
  lead: Lead | null
}

export function LeadTasksSection({ lead }: LeadTasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const { toast } = useToast()

  const fetchTasks = async () => {
    if (!lead) return
    setLoading(true)
    try {
      const data = await tasksService.getTasksByLead(lead.id)
      setTasks(data || [])
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      toast({
        title: 'Erro ao carregar tarefas',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lead) {
      fetchTasks()
    }
  }, [lead])

  const handleSaveTask = async (taskData: any) => {
    try {
      if (editingTask) {
        await tasksService.updateTask(editingTask.id, taskData)
        toast({ title: 'Tarefa atualizada com sucesso' })
      } else {
        await tasksService.createTask(taskData)
        toast({ title: 'Tarefa criada com sucesso' })
      }
      setIsDialogOpen(false)
      setEditingTask(null)
      fetchTasks()
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar tarefa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    try {
      await tasksService.deleteTask(taskToDelete.id)
      toast({ title: 'Tarefa excluída com sucesso' })
      setTaskToDelete(null)
      fetchTasks()
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir tarefa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Concluída' ? 'Pendente' : 'Concluída'

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    )

    try {
      await tasksService.updateTask(task.id, { status: newStatus })
      toast({
        title:
          newStatus === 'Concluída' ? 'Tarefa concluída' : 'Tarefa reaberta',
        duration: 2000,
      })
      fetchTasks()
    } catch (error: any) {
      fetchTasks()
      toast({
        title: 'Erro ao atualizar tarefa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (!lead) return null

  const pendingTasks = tasks.filter((t) => t.status !== 'Concluída')
  const completedTasks = tasks.filter((t) => t.status === 'Concluída')

  const defaultTaskValues = editingTask
    ? {
        titulo: editingTask.titulo,
        descricao: editingTask.descricao || '',
        prazo: editingTask.prazo ? new Date(editingTask.prazo) : new Date(),
        status: editingTask.status || 'Pendente',
        leadId: editingTask.lead_id || lead.id,
      }
    : undefined

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Tarefas de Follow-up</h3>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingTask(null)
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setEditingTask(null)}
            >
              <Plus className="h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask
                  ? 'Editar Tarefa'
                  : `Nova Tarefa para ${lead.company}`}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              leadId={lead.id}
              onSubmit={handleSaveTask}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingTask(null)
              }}
              defaultValues={defaultTaskValues}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4 h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            <p>Nenhuma tarefa agendada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pendentes
                </h4>
                <div className="space-y-2">
                  {pendingTasks.map((task) => {
                    const isOverdue =
                      task.prazo &&
                      isPast(new Date(task.prazo)) &&
                      !isToday(new Date(task.prazo))

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'group flex items-start justify-between gap-3 p-3 rounded-lg border bg-card transition-all hover:shadow-sm',
                          isOverdue &&
                            'border-red-200 bg-red-50/50 dark:bg-red-900/10',
                        )}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={false}
                            onCheckedChange={() => handleToggleComplete(task)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  'font-medium text-sm truncate',
                                  isOverdue && 'text-red-700 dark:text-red-400',
                                )}
                              >
                                {task.titulo}
                              </span>
                              {isOverdue && (
                                <span className="flex items-center text-[10px] text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded-full font-medium">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Atrasada
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {task.descricao || 'Sem descrição'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span
                                className={cn(
                                  isOverdue && 'text-red-600 font-medium',
                                )}
                              >
                                {task.prazo
                                  ? format(
                                      new Date(task.prazo),
                                      "dd 'de' MMM",
                                      {
                                        locale: ptBR,
                                      },
                                    )
                                  : 'Sem prazo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditTask(task)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setTaskToDelete(task)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Concluídas
                </h4>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/50 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 opacity-60">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm line-through text-muted-foreground">
                            {task.titulo}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditTask(task)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setTaskToDelete(task)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

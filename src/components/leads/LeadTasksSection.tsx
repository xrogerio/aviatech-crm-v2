import { useEffect, useState } from 'react'
import { Lead } from '@/context/LeadsContext'
import { Task, tasksService } from '@/services/tasksService'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
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

interface LeadTasksSectionProps {
  lead: Lead | null
}

export function LeadTasksSection({ lead }: LeadTasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksService.createTask(taskData)
      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi adicionada com sucesso.',
      })
      setIsDialogOpen(false)
      fetchTasks()
    } catch (error: any) {
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Concluída' ? 'Pendente' : 'Concluída'

    // Optimistic update
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
    } catch (error: any) {
      // Revert on error
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

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Tarefas de Follow-up</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa para {lead.company}</DialogTitle>
            </DialogHeader>
            <TaskForm
              leadId={lead.id}
              onSubmit={handleCreateTask}
              onCancel={() => setIsDialogOpen(false)}
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
            {/* Pending Tasks */}
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
                          'flex items-start gap-3 p-3 rounded-lg border bg-card transition-all hover:shadow-sm',
                          isOverdue &&
                            'border-red-200 bg-red-50/50 dark:bg-red-900/10',
                        )}
                      >
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
                                ? format(new Date(task.prazo), "dd 'de' MMM", {
                                    locale: ptBR,
                                  })
                                : 'Sem prazo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Concluídas
                </h4>
                <div className="space-y-2 opacity-60">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
                    >
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => handleToggleComplete(task)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm line-through text-muted-foreground">
                          {task.titulo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

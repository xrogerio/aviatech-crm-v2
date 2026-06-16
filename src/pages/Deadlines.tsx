import { useState, useEffect } from 'react'
import {
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { tasksService, Task } from '@/services/tasksService'
import { useAuth } from '@/context/AuthContext'
import { isPast, addDays, parseISO, format, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

export default function Deadlines() {
  const { user, role } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTasks() {
      if (!user) return
      try {
        setLoading(true)
        const fetchUserId =
          role === 'admin' || role === 'gerente' ? undefined : user.id
        const allTasks = await tasksService.getTasks(fetchUserId)

        // Filter out completed/rejected tasks and tasks without deadline
        const excludedStatuses = [
          'completed',
          'concluida',
          'concluído',
          'rejeitada',
          'rejeitado',
          'rejected',
          'cancelada',
          'cancelado',
          'done',
        ]

        const activeTasks = allTasks.filter((task) => {
          if (!task.prazo) return false
          if (
            task.status &&
            excludedStatuses.includes(task.status.toLowerCase())
          )
            return false
          return true
        })

        setTasks(activeTasks)
      } catch (error) {
        console.error('Error loading tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [user, role])

  const now = new Date()
  const next7Days = addDays(now, 7)

  const overdueTasks = tasks.filter((task) => isPast(parseISO(task.prazo!)))

  const upcomingTasks = tasks.filter((task) => {
    const prazo = parseISO(task.prazo!)
    return !isPast(prazo) && isBefore(prazo, next7Days)
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Controle de Prazos
          </h2>
          <p className="text-muted-foreground">
            Acompanhe tarefas vencidas e prazos para os próximos 7 dias.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                overdueTasks.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem ação imediata
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos 7 Dias
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                upcomingTasks.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Prazos próximos de vencer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Overdue Section */}
        <Card className="border-destructive/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Prazos Vencidos
            </CardTitle>
            <CardDescription>
              Tarefas que já passaram da data limite e ainda não foram
              concluídas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : overdueTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium">Nenhuma tarefa vencida!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ótimo trabalho mantendo tudo em dia.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col space-y-2 p-4 border rounded-lg bg-destructive/5 border-destructive/20 transition-colors hover:bg-destructive/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4
                          className="font-semibold text-sm line-clamp-1"
                          title={task.titulo}
                        >
                          {task.titulo}
                        </h4>
                        {task.leads && (
                          <p
                            className="text-xs text-muted-foreground line-clamp-1"
                            title={task.leads.empresa}
                          >
                            Lead:{' '}
                            <span className="font-medium text-foreground">
                              {task.leads.empresa}
                            </span>
                          </p>
                        )}
                      </div>
                      <Badge variant="destructive" className="shrink-0 ml-2">
                        Vencido
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs border-t border-destructive/10 mt-2">
                      <div className="flex items-center text-destructive font-medium mt-2">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {format(
                          parseISO(task.prazo!),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR },
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs mt-1"
                        asChild
                      >
                        <Link to={`/tasks`}>
                          Ver tarefas <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Section */}
        <Card className="border-amber-500/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-500 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximos de Vencer
            </CardTitle>
            <CardDescription>
              Tarefas com prazo de conclusão para os próximos 7 dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                <Calendar className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium">Nenhum prazo próximo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Você não tem tarefas vencendo nos próximos 7 dias.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col space-y-2 p-4 border rounded-lg bg-amber-500/5 border-amber-500/20 transition-colors hover:bg-amber-500/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4
                          className="font-semibold text-sm line-clamp-1"
                          title={task.titulo}
                        >
                          {task.titulo}
                        </h4>
                        {task.leads && (
                          <p
                            className="text-xs text-muted-foreground line-clamp-1"
                            title={task.leads.empresa}
                          >
                            Lead:{' '}
                            <span className="font-medium text-foreground">
                              {task.leads.empresa}
                            </span>
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 ml-2 text-amber-600 border-amber-500/50 bg-amber-500/10"
                      >
                        Próximo
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs border-t border-amber-500/10 mt-2">
                      <div className="flex items-center text-amber-600 dark:text-amber-500 font-medium mt-2">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {format(
                          parseISO(task.prazo!),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR },
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs mt-1"
                        asChild
                      >
                        <Link to={`/tasks`}>
                          Ver tarefas <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

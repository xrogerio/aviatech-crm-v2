import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLeads } from '@/context/LeadsContext'
import { useAuth } from '@/context/AuthContext'
import { projectsService, Project } from '@/services/projectsService'
import { proposalsService, Proposal } from '@/services/proposalsService'
import { tasksService, Task } from '@/services/tasksService'
import {
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
  CheckCircle2,
  DollarSign,
} from 'lucide-react'
import { isPast, addDays, parseISO, format, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  valor: {
    label: 'Receita',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export default function Index() {
  const { leads } = useLeads()
  const { user, role } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  useEffect(() => {
    projectsService.getProjects().then(setProjects).catch(console.error)
    proposalsService.getProposals().then(setProposals).catch(console.error)
  }, [])

  useEffect(() => {
    async function loadTasks() {
      if (!user) return
      try {
        setLoadingTasks(true)
        const fetchUserId =
          role === 'admin' || role === 'gerente' ? undefined : user.id
        const allTasks = await tasksService.getTasks(fetchUserId)

        const excludedStatuses = [
          'completed',
          'concluido',
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
        setLoadingTasks(false)
      }
    }

    loadTasks()
  }, [user, role])

  const closedProjects = projects.filter((p) => p.status === 'Fechado').length
  const activeProjects = projects.filter(
    (p) => p.status !== 'Fechado' && p.status !== 'Negado',
  ).length
  const conversionRate =
    projects.length > 0
      ? Math.round((closedProjects / projects.length) * 100)
      : 0

  const now = new Date()
  const next7Days = addDays(now, 7)

  const overdueTasks = tasks.filter((task) => isPast(parseISO(task.prazo!)))

  const upcomingTasks = tasks.filter((task) => {
    const prazo = parseISO(task.prazo!)
    return !isPast(prazo) && isBefore(prazo, next7Days)
  })

  const validProjectStatuses = [
    'Qualificação',
    'Proposta Enviada',
    'Negociação',
  ]
  const validProjects = projects.filter((p) =>
    validProjectStatuses.includes(p.status),
  )
  const validProjectIds = validProjects.map((p) => p.id)

  const estimatedProposals = proposals.filter(
    (p) =>
      p.status === 'Enviada' &&
      p.project_id &&
      validProjectIds.includes(p.project_id),
  )

  const totalEstimatedRevenue = estimatedProposals.reduce(
    (acc, curr) => acc + (curr.valor || 0),
    0,
  )

  const chartData = validProjectStatuses.map((status) => {
    const pIds = projects.filter((p) => p.status === status).map((p) => p.id)
    const total = proposals
      .filter(
        (p) =>
          p.status === 'Enviada' && p.project_id && pIds.includes(p.project_id),
      )
      .reduce((acc, curr) => acc + (curr.valor || 0), 0)

    return {
      status,
      valor: total,
    }
  })

  const closedProjectIds = projects
    .filter((p) => p.status === 'Fechado')
    .map((p) => p.id)
  const convertedProposals = proposals.filter(
    (p) =>
      p.status === 'Aprovada' &&
      p.project_id &&
      closedProjectIds.includes(p.project_id),
  )

  const totalConvertedRevenue = convertedProposals.reduce(
    (acc, curr) => acc + (curr.valor || 0),
    0,
  )

  const convertedChartData = [
    {
      status: 'Fechado',
      valor: totalConvertedRevenue,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Leads
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Fechados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Receita Estimada
            </CardTitle>
            <CardDescription>
              Valor total de propostas enviadas nos projetos em andamento. Total
              acumulado:{' '}
              <span className="font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(totalEstimatedRevenue)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.every((d) => d.valor === 0) ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center border rounded-lg border-dashed">
                <DollarSign className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium">Nenhuma receita estimada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Não há propostas enviadas nas fases ativas do funil.
                </p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `R$ ${value >= 1000 ? value / 1000 + 'k' : value}`
                    }
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    fontSize={12}
                    width={80}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--color-valor)', opacity: 0.1 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(value as number)
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="valor"
                    fill="var(--color-valor)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Total Convertido
            </CardTitle>
            <CardDescription>
              Valor total de propostas aprovadas em negócios fechados. Total
              acumulado:{' '}
              <span className="font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(totalConvertedRevenue)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {convertedChartData.every((d) => d.valor === 0) ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center border rounded-lg border-dashed">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium">Nenhum valor convertido</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Não há propostas aprovadas em negócios fechados.
                </p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={convertedChartData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `R$ ${value >= 1000 ? value / 1000 + 'k' : value}`
                    }
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    fontSize={12}
                    width={80}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--color-valor)', opacity: 0.1 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(value as number)
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="valor"
                    fill="var(--color-valor)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
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
              {loadingTasks ? (
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
              {loadingTasks ? (
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
            {loadingTasks ? (
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
                        <Link to={`/tarefas`}>
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
            {loadingTasks ? (
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
                        <Link to={`/tarefas`}>
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

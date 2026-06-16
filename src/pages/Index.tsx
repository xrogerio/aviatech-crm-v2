import { useEffect, useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import { Clock, TrendingUp, Users, DollarSign } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { tasksService, type Task } from '@/services/tasksService'
import { format, subMonths, isSameMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'

export default function Index() {
  const { leads } = useLeads()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksService.getTasks()
        setTasks(data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    fetchTasks()

    const channel = supabase
      .channel('dashboard-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // --- Metrics Calculations ---
  const metrics = useMemo(() => {
    const totalLeads = leads.length
    const newLeadsThisMonth = leads.filter((l) =>
      isSameMonth(parseISO(l.createdAt), new Date()),
    ).length

    const wonLeads = leads.filter((l) => l.status === 'Fechado Ganho')
    const wonCount = wonLeads.length

    const conversionRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0

    // Consider all active leads (not lost) for estimated revenue
    const activeLeads = leads.filter((l) => l.status !== 'Fechado Perdido')

    const estimatedRevenue = activeLeads.reduce((acc, lead) => {
      // Sum all valid proposals values for this lead (excluding explicitly rejected ones)
      const validProposals = lead.proposals.filter(
        (p) => p.status !== 'Rejeitada' && p.status !== 'Recusada',
      )
      const leadRevenue = validProposals.reduce(
        (sum, p) => sum + (p.valor || 0),
        0,
      )
      return acc + leadRevenue
    }, 0)

    // Active activities: status is not 'Concluída'
    const activeActivities = tasks.filter(
      (t) => t.status !== 'Concluída',
    ).length

    return {
      totalLeads,
      newLeadsThisMonth,
      conversionRate,
      estimatedRevenue,
      activeActivities,
    }
  }, [leads, tasks])

  // --- Revenue Chart Data (Last 6 Months) ---
  const revenueChartData = useMemo(() => {
    const today = new Date()
    const data = []

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i)
      const monthKey = format(date, 'MMM', { locale: ptBR })
      // Capitalize first letter (jan -> Jan)
      const formattedLabel =
        monthKey.charAt(0).toUpperCase() + monthKey.slice(1)

      const monthRevenue = leads
        .filter((lead) => {
          if (lead.status !== 'Fechado Ganho') return false
          const leadDate = parseISO(lead.createdAt)
          return isSameMonth(leadDate, date)
        })
        .reduce((acc, lead) => {
          const approvedProposals = lead.proposals.filter(
            (p) => p.status === 'Aprovada',
          )
          const val = approvedProposals.reduce(
            (sum, p) => sum + (p.valor || 0),
            0,
          )
          return acc + val
        }, 0)

      data.push({
        month: formattedLabel,
        revenue: monthRevenue,
      })
    }
    return data
  }, [leads])

  // --- Pipeline Chart Data ---
  const pipelineChartData = useMemo(() => {
    const stages = [
      'Novo Lead',
      'Qualificação',
      'Proposta Enviada',
      'Negociação',
      'Fechado Ganho',
    ]

    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ]

    return stages.map((stage, index) => ({
      stage,
      count: leads.filter((l) => l.status === stage).length,
      fill: colors[index % colors.length],
    }))
  }, [leads])

  // --- Chart Configs ---
  const revenueConfig: ChartConfig = {
    revenue: {
      label: 'Receita (R$)',
      color: 'hsl(var(--chart-1))',
    },
  }

  const pipelineConfig: ChartConfig = {
    count: {
      label: 'Quantidade',
    },
    'Novo Lead': {
      label: 'Novo Lead',
      color: 'hsl(var(--chart-1))',
    },
    Qualificação: {
      label: 'Qualificação',
      color: 'hsl(var(--chart-2))',
    },
    'Proposta Enviada': {
      label: 'Proposta Enviada',
      color: 'hsl(var(--chart-3))',
    },
    Negociação: {
      label: 'Negociação',
      color: 'hsl(var(--chart-4))',
    },
    'Fechado Ganho': {
      label: 'Fechado Ganho',
      color: 'hsl(var(--chart-5))',
    },
  }

  // Helper for currency formatting
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCompactCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section: Customer Journey */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard de Vendas
          </h2>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Leads
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.newLeadsThisMonth} novos este mês
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de fechamento global
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Estimada
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCompactCurrency(metrics.estimatedRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total no pipeline de vendas
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atividades Ativas
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeActivities}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas pendentes no sistema
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Charts Section */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-card">
          <CardHeader>
            <CardTitle>Relatório de Receita</CardTitle>
            <CardDescription>
              Receita de leads ganhos nos últimos 6 meses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={revenueConfig} className="h-[300px] w-full">
              <LineChart
                data={revenueChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={2}
                  stroke="var(--color-revenue)"
                  activeDot={{ r: 8 }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Distribuição de Pipeline</CardTitle>
            <CardDescription>
              Volume atual de leads por etapa do funil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pipelineConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                data={pipelineChartData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="stage"
                  type="category"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  layout="vertical"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Task, tasksService } from '@/services/tasksService'
import { useLeads } from '@/context/LeadsContext'
import { useToast } from '@/hooks/use-toast'
import { format, isPast, isToday, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Search,
  Filter,
  CalendarIcon,
  User,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Checkbox } from '@/components/ui/checkbox'

export default function Activities() {
  const { user, role } = useAuth()
  const { leads } = useLeads()
  const { toast } = useToast()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [filterLead, setFilterLead] = useState<string>('all')

  const fetchTasks = async () => {
    if (!user) return
    setLoading(true)
    try {
      // If Vendedor, filter by their ID. If Admin/Gerente, fetch all (undefined).
      const userIdToFilter = role === 'vendedor' ? user.id : undefined

      const data = await tasksService.getTasks(userIdToFilter)
      setTasks(data || [])
    } catch (error: any) {
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
    fetchTasks()
  }, [user, role])

  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksService.createTask(taskData)
      toast({
        title: 'Tarefa criada',
        description: 'Nova tarefa adicionada com sucesso.',
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

    // Optimistic Update
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
      fetchTasks() // Revert
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      const searchMatch =
        task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.leads?.empresa.toLowerCase().includes(searchTerm.toLowerCase())

      if (!searchMatch) return false

      // Status Filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'Pendente' && task.status === 'Concluída')
          return false
        if (filterStatus === 'Concluída' && task.status !== 'Concluída')
          return false
        if (filterStatus === 'Em Andamento' && task.status !== 'Em Andamento')
          return false
      }

      // Date Filter
      if (filterDate && task.prazo) {
        if (!isSameDay(new Date(task.prazo), filterDate)) return false
      }

      // Lead Filter
      if (filterLead !== 'all' && task.lead_id !== filterLead) return false

      return true
    })
  }, [tasks, searchTerm, filterStatus, filterDate, filterLead])

  const pendingTasks = filteredTasks.filter((t) => t.status !== 'Concluída')
  const completedTasks = filteredTasks.filter((t) => t.status === 'Concluída')

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestão de Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize suas atividades e não perca prazos.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="Pendente">Pendentes</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Concluída">Concluídas</SelectItem>
            </SelectContent>
          </Select>

          {/* Lead Filter */}
          <Select value={filterLead} onValueChange={setFilterLead}>
            <SelectTrigger className="w-[180px] bg-background">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder="Lead" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Leads</SelectItem>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[180px] justify-start text-left font-normal bg-background',
                  !filterDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate
                  ? format(filterDate, 'dd/MM/yyyy')
                  : 'Data de Prazo'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
                initialFocus
              />
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setFilterDate(undefined)}
                >
                  Limpar Data
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="pending" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="pending">
            Pendentes
            {pendingTasks.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 px-1.5 text-[10px]"
              >
                {pendingTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="flex-1 min-h-0 mt-4">
          <ScrollArea className="h-full rounded-md border bg-card p-4">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhuma tarefa pendente encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => {
                  const isOverdue =
                    task.prazo &&
                    isPast(new Date(task.prazo)) &&
                    !isToday(new Date(task.prazo))
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border bg-background transition-all hover:shadow-md group',
                        isOverdue &&
                          'border-red-200 bg-red-50/30 dark:bg-red-900/10',
                      )}
                    >
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="h-5 w-5"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={cn(
                              'font-semibold text-base',
                              isOverdue && 'text-red-700 dark:text-red-400',
                            )}
                          >
                            {task.titulo}
                          </h4>
                          {isOverdue && (
                            <Badge
                              variant="destructive"
                              className="h-5 px-1.5 text-[10px] uppercase"
                            >
                              Atrasada
                            </Badge>
                          )}
                          {task.status === 'Em Andamento' && (
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-[10px] bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Em Andamento
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          {task.leads && (
                            <span className="flex items-center gap-1 text-primary/80">
                              <User className="h-3.5 w-3.5" />
                              {task.leads.empresa}
                            </span>
                          )}

                          <span
                            className={cn(
                              'flex items-center gap-1',
                              isOverdue && 'text-red-600 font-medium',
                            )}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {task.prazo
                              ? format(
                                  new Date(task.prazo),
                                  "dd 'de' MMM, yyyy",
                                  { locale: ptBR },
                                )
                              : 'Sem prazo'}
                          </span>
                        </div>

                        {task.descricao && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {task.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="flex-1 min-h-0 mt-4">
          <ScrollArea className="h-full rounded-md border bg-card p-4">
            {completedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Circle className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhuma tarefa concluída encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3 opacity-80">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-muted/40 transition-all"
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="h-5 w-5"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base line-through text-muted-foreground">
                        {task.titulo}
                      </h4>

                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {task.leads && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {task.leads.empresa}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {task.prazo
                            ? format(new Date(task.prazo), 'dd/MM/yyyy')
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

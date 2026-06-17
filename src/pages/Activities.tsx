import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Task, tasksService } from '@/services/tasksService'
import { Project, projectsService } from '@/services/projectsService'
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
  Pencil,
  Trash2,
  FolderKanban,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [filterLead, setFilterLead] = useState<string>('all')
  const [filterProject, setFilterProject] = useState<string>('all')

  const [projects, setProjects] = useState<Project[]>([])

  const handleLeadChange = (value: string) => {
    setFilterLead(value)
    if (value !== 'all' && filterProject !== 'all') {
      const proj = projects.find((p) => p.id === filterProject)
      if (proj && proj.lead_id !== value) {
        setFilterProject('all')
      }
    }
  }

  const handleProjectChange = (value: string) => {
    setFilterProject(value)
    if (value !== 'all') {
      const proj = projects.find((p) => p.id === value)
      if (proj && proj.lead_id) {
        setFilterLead(proj.lead_id)
      }
    }
  }

  const availableStatuses = useMemo(() => {
    let relevantTasks = tasks

    if (filterLead !== 'all') {
      relevantTasks = relevantTasks.filter(
        (t) =>
          t.lead_id === filterLead ||
          (t.project_id &&
            projects.find((p) => p.id === t.project_id)?.lead_id ===
              filterLead),
      )
    }

    if (filterProject !== 'all') {
      relevantTasks = relevantTasks.filter(
        (t) => t.project_id === filterProject,
      )
    }

    const statuses = new Set<string>()
    relevantTasks.forEach((t) => {
      if (t.status) statuses.add(t.status)
    })
    return Array.from(statuses).sort()
  }, [tasks, filterLead, filterProject, projects])

  const availableProjects = useMemo(() => {
    let relevantProjects = projects

    if (filterLead !== 'all') {
      relevantProjects = relevantProjects.filter(
        (p) => p.lead_id === filterLead,
      )
    }

    if (filterStatus !== 'all') {
      relevantProjects = relevantProjects.filter((p) =>
        tasks.some((t) => t.project_id === p.id && t.status === filterStatus),
      )
    }

    return relevantProjects
  }, [projects, tasks, filterLead, filterStatus])

  const availableLeads = useMemo(() => {
    let relevantLeads = leads

    if (filterProject !== 'all') {
      const proj = projects.find((p) => p.id === filterProject)
      if (proj && proj.lead_id) {
        relevantLeads = relevantLeads.filter((l) => l.id === proj.lead_id)
      }
    }

    if (filterStatus !== 'all') {
      relevantLeads = relevantLeads.filter((l) =>
        tasks.some(
          (t) =>
            (t.lead_id === l.id ||
              (t.project_id &&
                projects.find((p) => p.id === t.project_id)?.lead_id ===
                  l.id)) &&
            t.status === filterStatus,
        ),
      )
    }

    return relevantLeads
  }, [leads, projects, tasks, filterProject, filterStatus])

  useEffect(() => {
    if (filterStatus !== 'all' && !availableStatuses.includes(filterStatus)) {
      setFilterStatus('all')
    }
  }, [availableStatuses, filterStatus])

  useEffect(() => {
    if (
      filterProject !== 'all' &&
      !availableProjects.find((p) => p.id === filterProject)
    ) {
      setFilterProject('all')
    }
  }, [availableProjects, filterProject])

  useEffect(() => {
    if (
      filterLead !== 'all' &&
      !availableLeads.find((l) => l.id === filterLead)
    ) {
      setFilterLead('all')
    }
  }, [availableLeads, filterLead])

  const fetchProjects = async () => {
    try {
      const data = await projectsService.getProjects()
      setProjects(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar projetos:', error)
    }
  }

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
    fetchProjects()
  }, [user, role])

  const handleSaveTask = async (taskData: any) => {
    try {
      if (editingTask) {
        await tasksService.updateTask(editingTask.id, taskData)
        toast({
          title: 'Tarefa atualizada',
          description: 'A tarefa foi atualizada com sucesso.',
        })
      } else {
        await tasksService.createTask(taskData)
        toast({
          title: 'Tarefa criada',
          description: 'Nova tarefa adicionada com sucesso.',
        })
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
        task.leads?.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.descricao?.toLowerCase().includes(searchTerm.toLowerCase())

      if (!searchMatch) return false

      // Status Filter
      if (filterStatus !== 'all') {
        if (task.status !== filterStatus) return false
      }

      // Date Filter
      if (filterDate && task.prazo) {
        if (!isSameDay(new Date(task.prazo), filterDate)) return false
      }

      // Lead Filter
      if (filterLead !== 'all') {
        const proj = projects.find((p) => p.id === task.project_id)
        const isDirect = task.lead_id === filterLead
        const isViaProject = proj?.lead_id === filterLead
        if (!isDirect && !isViaProject) return false
      }

      // Project Filter
      if (filterProject !== 'all' && task.project_id !== filterProject)
        return false

      return true
    })
  }, [
    tasks,
    searchTerm,
    filterStatus,
    filterDate,
    filterLead,
    filterProject,
    projects,
  ])

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
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingTask(null)
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="rounded-full shadow-lg"
              onClick={() => setEditingTask(null)}
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={handleSaveTask}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingTask(null)
              }}
              defaultValues={
                editingTask
                  ? {
                      titulo: editingTask.titulo,
                      descricao: editingTask.descricao || '',
                      prazo: editingTask.prazo
                        ? new Date(editingTask.prazo)
                        : new Date(),
                      status: editingTask.status || 'Pendente',
                      projectId: editingTask.project_id || '',
                      leadId: editingTask.lead_id || '',
                    }
                  : undefined
              }
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
          {/* Lead Filter */}
          <Select value={filterLead} onValueChange={handleLeadChange}>
            <SelectTrigger className="w-[180px] bg-background">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder="Lead" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Leads</SelectItem>
              {availableLeads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Filter */}
          <Select value={filterProject} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[180px] bg-background">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                <SelectValue placeholder="Projeto" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Projetos</SelectItem>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
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
                          {task.projects && (
                            <span className="flex items-center gap-1 text-primary/80">
                              <FolderKanban className="h-3.5 w-3.5" />
                              {task.projects.name}
                            </span>
                          )}
                          {!task.projects && task.leads && (
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
                            <span className="font-medium">Prazo:</span>
                            {task.prazo
                              ? format(
                                  new Date(task.prazo),
                                  "dd 'de' MMM, yyyy",
                                  { locale: ptBR },
                                )
                              : 'Sem prazo'}
                          </span>

                          {task.created_at && (
                            <span className="flex items-center gap-1 text-muted-foreground/70">
                              <CalendarIcon className="h-3 w-3" />
                              <span className="font-medium">Criação em:</span>
                              {format(
                                new Date(task.created_at),
                                'dd/MM/yyyy HH:mm',
                              )}
                            </span>
                          )}
                          {task.updated_at && (
                            <span className="flex items-center gap-1 text-muted-foreground/70">
                              <Pencil className="h-3 w-3" />
                              <span className="font-medium">
                                Última edição:
                              </span>
                              {format(
                                new Date(task.updated_at),
                                'dd/MM/yyyy HH:mm',
                              )}
                            </span>
                          )}
                        </div>

                        {task.descricao && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {task.descricao}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTask(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setTaskToDelete(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                    className="flex items-center gap-4 p-4 rounded-xl border bg-muted/40 transition-all group"
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

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {task.projects && (
                          <span className="flex items-center gap-1">
                            <FolderKanban className="h-3.5 w-3.5" />
                            {task.projects.name}
                          </span>
                        )}
                        {!task.projects && task.leads && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {task.leads.empresa}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium">Prazo:</span>
                          {task.prazo
                            ? format(new Date(task.prazo), 'dd/MM/yyyy')
                            : '-'}
                        </span>

                        {task.created_at && (
                          <span className="flex items-center gap-1 text-muted-foreground/70">
                            <CalendarIcon className="h-3 w-3" />
                            <span className="font-medium">Criação em:</span>
                            {format(
                              new Date(task.created_at),
                              'dd/MM/yyyy HH:mm',
                            )}
                          </span>
                        )}
                        {task.updated_at && (
                          <span className="flex items-center gap-1 text-muted-foreground/70">
                            <Pencil className="h-3 w-3" />
                            <span className="font-medium">Última edição:</span>
                            {format(
                              new Date(task.updated_at),
                              'dd/MM/yyyy HH:mm',
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditTask(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setTaskToDelete(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

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

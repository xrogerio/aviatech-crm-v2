import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { CreateTaskDTO } from '@/services/tasksService'
import { useAuth } from '@/context/AuthContext'

const taskSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório'),
  descricao: z.string().optional(),
  prazo: z.date({ required_error: 'O prazo é obrigatório' }),
  status: z.string().default('Pendente'),
  projectId: z.string().optional(),
  leadId: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  projectId?: string
  leadId?: string
  onSubmit: (data: CreateTaskDTO) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<TaskFormValues>
}

export function TaskForm({
  projectId,
  leadId,
  onSubmit,
  onCancel,
  defaultValues,
}: TaskFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [openProjectSelect, setOpenProjectSelect] = useState(false)
  const { user } = useAuth()

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    import('@/services/projectsService').then(({ projectsService }) => {
      projectsService
        .getProjects()
        .then((data) => {
          setProjects(data)
          setLoadingProjects(false)
        })
        .catch(console.error)
    })
  }, [])

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      status: 'Pendente',
      prazo: new Date(),
      projectId: projectId || '',
      leadId: leadId || '',
      ...defaultValues,
    },
  })

  // Synchronize dynamic defaults for project
  useEffect(() => {
    if (projectId) {
      form.setValue('projectId', projectId)
    }
  }, [projectId, form])

  // Synchronize dynamic defaults for lead
  useEffect(() => {
    if (leadId) {
      form.setValue('leadId', leadId)
    }
  }, [leadId, form])

  const handleSubmit = async (values: TaskFormValues) => {
    if (!user) return
    setSubmitting(true)
    try {
      await onSubmit({
        titulo: values.titulo,
        descricao: values.descricao || null,
        prazo: values.prazo.toISOString(),
        status: values.status,
        project_id: values.projectId || null,
        lead_id: values.leadId || null,
        user_id: user.id,
      })
      form.reset({
        titulo: '',
        descricao: '',
        status: 'Pendente',
        prazo: new Date(),
        projectId: projectId || '',
        leadId: leadId || '',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!projectId && (
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Projeto</FormLabel>
                <Popover
                  open={openProjectSelect}
                  onOpenChange={setOpenProjectSelect}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProjectSelect}
                        disabled={loadingProjects}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value
                          ? projects.find((p) => p.id === field.value)?.name ||
                            'Projeto não encontrado'
                          : 'Selecione um projeto...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar projeto..." />
                      <CommandList>
                        <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                        <CommandGroup>
                          {projects.map((project) => (
                            <CommandItem
                              value={project.name}
                              key={project.id}
                              onSelect={() => {
                                form.setValue('projectId', project.id)
                                setOpenProjectSelect(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  project.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {project.name}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Título <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Ligar para agendar reunião"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prazo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Prazo <span className="text-destructive">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy')
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes adicionais sobre a tarefa..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Tarefa
          </Button>
        </div>
      </form>
    </Form>
  )
}

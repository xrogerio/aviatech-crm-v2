import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { useLeads } from '@/context/LeadsContext'
import { Proposal, proposalsService } from '@/services/proposalsService'
import { projectsService, Project } from '@/services/projectsService'
import { usersService, UserProfile } from '@/services/usersService'

const parseNumericValue = (val: unknown): number => {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val
  }
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (!trimmed) return 0
    // Replace comma with dot if present to support pt-BR format (e.g. "198,92" or "198.92")
    const normalized = trimmed.replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

const proposalSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  project_id: z.string().min(1, 'Selecione um projeto'),
  lead_id: z.string().min(1, 'Lead é obrigatório'),
  signatory_id: z.string().min(1, 'Selecione um signatário'),
  descricao: z.string().optional(),
  observacoes: z.string().optional(),
  validade: z.date().optional(),
  status: z.enum(['Rascunho', 'Enviada', 'Aprovada', 'Rejeitada']),
  itens: z
    .array(
      z.object({
        description: z.string().min(1, 'Descrição do item obrigatória'),
        quantity: z
          .union([z.number(), z.string()])
          .transform((val) => parseNumericValue(val))
          .pipe(z.number().min(1, 'Quantidade mínima é 1')),
        unitPrice: z
          .union([z.number(), z.string()])
          .transform((val) => parseNumericValue(val))
          .pipe(
            z.number().min(0, 'Valor unitário deve ser maior ou igual a 0'),
          ),
      }),
    )
    .min(1, 'Adicione pelo menos um item à proposta'),
})

type ProposalFormValues = z.input<typeof proposalSchema>
type ProposalFormOutput = z.output<typeof proposalSchema>

interface ProposalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: any) => Promise<void>
  initialData?: Proposal | null
}

export function ProposalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ProposalFormDialogProps) {
  const { leads } = useLeads()
  const [projects, setProjects] = useState<Project[]>([])
  const [usersList, setUsersList] = useState<UserProfile[]>([])
  const [generatedNumber, setGeneratedNumber] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const promises: [
          Promise<Project[]>,
          Promise<UserProfile[]>,
          Promise<string>?,
        ] = [projectsService.getProjects(), usersService.getUsers()]
        if (!initialData) {
          promises.push(proposalsService.generateNextProposalNumber())
        }
        const [projectsData, usersData, nextNumber] =
          await Promise.all(promises)
        setProjects(projectsData)
        setUsersList(usersData)
        if (nextNumber) {
          setGeneratedNumber(nextNumber)
        }
      } catch (error) {
        console.error('Failed to load data', error)
      }
    }
    if (open) loadData()
  }, [open, initialData])

  const form = useForm<ProposalFormValues, any, ProposalFormOutput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      titulo: '',
      lead_id: '',
      project_id: '',
      signatory_id: '',
      descricao: '',
      observacoes: '',
      status: 'Rascunho',
      itens: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const projectId = form.watch('project_id')

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId)
      if (project && project.lead_id) {
        form.setValue('lead_id', project.lead_id)
      } else {
        form.setValue('lead_id', '')
      }
    } else {
      form.setValue('lead_id', '')
    }
  }, [projectId, projects, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  })

  const watchedItems = form.watch('itens')
  const totalValue = watchedItems?.reduce(
    (acc, item) =>
      acc +
      parseNumericValue(item?.quantity) * parseNumericValue(item?.unitPrice),
    0,
  )

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          titulo: initialData.titulo,
          lead_id: initialData.lead_id || '',
          project_id: initialData.project_id || '',
          signatory_id: initialData.signatory_id || '',
          descricao: initialData.descricao || '',
          observacoes: initialData.observacoes || '',
          validade: initialData.validade
            ? new Date(initialData.validade)
            : undefined,
          status: initialData.status,
          itens:
            initialData.itens && initialData.itens.length > 0
              ? initialData.itens
              : [{ description: '', quantity: 1, unitPrice: 0 }],
        })
      } else {
        form.reset({
          titulo: '',
          lead_id: '',
          project_id: '',
          signatory_id: '',
          descricao: '',
          observacoes: '',
          validade: undefined,
          status: 'Rascunho',
          itens: [{ description: '', quantity: 1, unitPrice: 0 }],
        })
      }
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: ProposalFormOutput) => {
    try {
      // Ensure items have numeric quantity and unitPrice
      const sanitizedItens = values.itens.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }))

      // Inject calculated total value and proposal number if creating
      const submissionData: any = {
        ...values,
        validade: values.validade,
        itens: sanitizedItens,
        valor: totalValue,
      }
      if (!initialData && generatedNumber) {
        submissionData.numero = generatedNumber
      }
      await onSubmit(submissionData)
      onOpenChange(false)
    } catch (error) {
      // Error is caught by the parent to show toast, we just keep the modal open
    }
  }

  const selectedLeadId = form.watch('lead_id')
  const selectedLead = leads.find((l) => l.id === selectedLeadId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Proposta' : 'Nova Proposta'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da proposta comercial.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Proposta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Proposta de Desenvolvimento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Número da Proposta</FormLabel>
              <FormControl>
                <Input
                  readOnly
                  value={initialData?.numero || generatedNumber || 'Gerando...'}
                  className="bg-muted text-muted-foreground font-mono md:w-1/2"
                />
              </FormControl>
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lead_id"
                render={({ field }) => {
                  const selectedLead = leads.find((l) => l.id === field.value)
                  return (
                    <FormItem>
                      <FormLabel>Cliente (Lead)</FormLabel>
                      <FormControl>
                        <Input
                          readOnly
                          value={
                            selectedLead
                              ? `${selectedLead.company || ''} - ${selectedLead.contactName || ''}`
                              : 'Selecione um projeto para carregar o cliente'
                          }
                          className="bg-muted text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validade"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Validade da Proposta</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
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
                          <SelectValue placeholder="Status atual" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rascunho">Rascunho</SelectItem>
                        <SelectItem value="Enviada">Enviada</SelectItem>
                        <SelectItem value="Aprovada">Aprovada</SelectItem>
                        <SelectItem value="Rejeitada">Rejeitada</SelectItem>
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
                  <FormLabel>Descrição / Introdução</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes iniciais da proposta..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Itens e Serviços</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ description: '', quantity: 1, unitPrice: 0 })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                </Button>
              </div>

              <div className="border rounded-md p-4 space-y-4 bg-muted/20">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-3 items-end"
                  >
                    <div className="col-span-6">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                              Descrição
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Descrição do serviço/produto"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                              Qtd
                            </FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                              Valor Unit.
                            </FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end items-center gap-2 text-lg font-semibold">
                <span>Total Estimado:</span>
                <span className="text-primary">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalValue)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Finais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Termos, condições ou notas adicionais..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
              <FormField
                control={form.control}
                name="signatory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signatário (Sua Empresa)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um signatário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersList.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} {u.cargo ? `(${u.cargo})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Signatário (Cliente)</FormLabel>
                <div className="mt-2 text-sm p-2 px-3 border bg-muted text-muted-foreground rounded-md min-h-10 flex items-center">
                  {selectedLead
                    ? selectedLead.contactName || ''
                    : 'Selecione um projeto'}
                </div>
              </FormItem>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Proposta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

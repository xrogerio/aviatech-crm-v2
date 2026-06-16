import { useEffect } from 'react'
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
import { Proposal } from '@/services/proposalsService'

const proposalSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  lead_id: z.string().min(1, 'Selecione um lead'),
  descricao: z.string().optional(),
  observacoes: z.string().optional(),
  validade: z.date().optional(),
  status: z.enum(['Rascunho', 'Enviada', 'Aprovada', 'Rejeitada']),
  itens: z
    .array(
      z.object({
        description: z.string().min(1, 'Descrição do item obrigatória'),
        quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
        unitPrice: z.coerce.number().min(0, 'Valor unitário inválido'),
      }),
    )
    .min(1, 'Adicione pelo menos um item à proposta'),
})

type ProposalFormValues = z.infer<typeof proposalSchema>

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

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      titulo: '',
      lead_id: '',
      descricao: '',
      observacoes: '',
      status: 'Rascunho',
      itens: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  })

  const watchedItems = form.watch('itens')
  const totalValue = watchedItems?.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  )

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          titulo: initialData.titulo,
          lead_id: initialData.lead_id || '',
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
          descricao: '',
          observacoes: '',
          validade: undefined,
          status: 'Rascunho',
          itens: [{ description: '', quantity: 1, unitPrice: 0 }],
        })
      }
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: ProposalFormValues) => {
    // Inject calculated total value
    const submissionData = {
      ...values,
      valor: totalValue,
    }
    await onSubmit(submissionData)
    onOpenChange(false)
  }

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="lead_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente (Lead)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.company} - {lead.contactName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                              />
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

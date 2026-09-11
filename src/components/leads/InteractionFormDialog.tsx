import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  interactionsService,
  Interaction,
} from '@/services/interactionsService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'

const formSchema = z.object({
  tipo: z.string().min(1, 'Selecione um tipo'),
  interaction_date: z.string().min(1, 'A data é obrigatória'),
  hours_used: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!isNaN(Number(val.replace(',', '.'))) &&
          Number(val.replace(',', '.')) >= 0),
      'Informe um número válido de horas',
    ),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
})

type FormValues = z.infer<typeof formSchema>

interface InteractionFormDialogProps {
  leadId?: string
  projectId?: string
  interaction?: Interaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function InteractionFormDialog({
  leadId,
  projectId,
  interaction,
  open,
  onOpenChange,
  onSuccess,
}: InteractionFormDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: '',
      interaction_date: new Date().toISOString().split('T')[0],
      hours_used: '',
      descricao: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (interaction) {
        const dateValue = interaction.interaction_date
          ? interaction.interaction_date.includes('T')
            ? interaction.interaction_date.split('T')[0]
            : interaction.interaction_date
          : interaction.created_at
            ? interaction.created_at.split('T')[0]
            : new Date().toISOString().split('T')[0]

        form.reset({
          tipo: interaction.tipo,
          interaction_date: dateValue,
          hours_used:
            interaction.hours_used !== undefined &&
            interaction.hours_used !== null
              ? String(interaction.hours_used)
              : '',
          descricao: interaction.descricao || '',
        })
      } else {
        form.reset({
          tipo: '',
          interaction_date: new Date().toISOString().split('T')[0],
          hours_used: '',
          descricao: '',
        })
      }
    }
  }, [open, form, interaction])

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      const parsedHours =
        values.hours_used && values.hours_used.trim() !== ''
          ? Number(values.hours_used.replace(',', '.'))
          : null

      if (interaction) {
        await interactionsService.updateInteraction(interaction.id, {
          tipo: values.tipo,
          descricao: values.descricao,
          project_id: projectId,
          interaction_date: values.interaction_date || null,
          hours_used: parsedHours,
        })
        toast({ title: 'Interação atualizada com sucesso' })
      } else {
        await interactionsService.createInteraction({
          lead_id: leadId === 'unassigned' ? null : leadId,
          project_id: projectId,
          tipo: values.tipo,
          descricao: values.descricao,
          user_id: user?.id,
          interaction_date: values.interaction_date || null,
          hours_used: parsedHours,
        })
        toast({ title: 'Interação registrada com sucesso' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao salvar interação',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {interaction ? 'Editar Interação' : 'Nova Interação'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Reunião">Reunião</SelectItem>
                      <SelectItem value="Ligação">Ligação</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours_used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas utilizadas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="Ex: 1.5"
                        {...field}
                      />
                    </FormControl>
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
                      placeholder="Descreva a interação..."
                      className="min-h-[100px]"
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
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

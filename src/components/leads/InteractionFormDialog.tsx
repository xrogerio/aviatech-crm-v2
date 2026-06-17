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
  descricao: z.string().min(1, 'A descrição é obrigatória'),
})

type FormValues = z.infer<typeof formSchema>

interface InteractionFormDialogProps {
  leadId: string
  interaction?: Interaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function InteractionFormDialog({
  leadId,
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
      descricao: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (interaction) {
        form.reset({
          tipo: interaction.tipo,
          descricao: interaction.descricao || '',
        })
      } else {
        form.reset({
          tipo: '',
          descricao: '',
        })
      }
    }
  }, [open, form, interaction])

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      if (interaction) {
        await interactionsService.updateInteraction(interaction.id, {
          tipo: values.tipo,
          descricao: values.descricao,
        })
        toast({ title: 'Interação atualizada com sucesso' })
      } else {
        await interactionsService.createInteraction({
          lead_id: leadId,
          tipo: values.tipo,
          descricao: values.descricao,
          user_id: user?.id,
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

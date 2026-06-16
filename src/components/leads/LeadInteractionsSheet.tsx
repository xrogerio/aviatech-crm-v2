import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarIcon,
  MessageSquare,
  Phone,
  Mail,
  Send,
  Loader2,
  Clock,
  Users,
  CheckSquare,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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
import { DatePicker } from '@/components/ui/date-picker'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { Lead } from '@/context/LeadsContext'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'
import { LeadTasksSection } from './LeadTasksSection'

const interactionSchema = z.object({
  tipo: z.enum(['Reunião', 'Ligação', 'E-mail', 'WhatsApp'], {
    required_error: 'Selecione o tipo de interação',
  }),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  data: z.date({ required_error: 'A data é obrigatória' }),
})

type InteractionFormValues = z.infer<typeof interactionSchema>

interface Interaction {
  id: string
  tipo: string
  descricao: string | null
  data: string
  user?: {
    role: string
  } | null
}

interface LeadInteractionsSheetProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadInteractionsSheet({
  lead,
  open,
  onOpenChange,
}: LeadInteractionsSheetProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      tipo: undefined,
      descricao: '',
      data: new Date(),
    },
  })

  const fetchInteractions = async () => {
    if (!lead) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select(
          `
          id,
          tipo,
          descricao,
          data,
          user:users (
            role
          )
        `,
        )
        .eq('lead_id', lead.id)
        .order('data', { ascending: false })

      if (error) throw error

      setInteractions(data || [])
    } catch (error: any) {
      console.error('Error fetching interactions:', error)
      toast({
        title: 'Erro ao carregar histórico',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && lead) {
      fetchInteractions()
      form.reset({
        tipo: undefined,
        descricao: '',
        data: new Date(),
      })
    }
  }, [open, lead])

  const onSubmit = async (values: InteractionFormValues) => {
    if (!lead || !user) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('interactions').insert({
        lead_id: lead.id,
        user_id: user.id,
        tipo: values.tipo,
        descricao: values.descricao,
        data: values.data.toISOString(),
      })

      if (error) throw error

      toast({
        title: 'Interação registrada!',
        description: 'O histórico foi atualizado com sucesso.',
      })

      form.reset({
        tipo: undefined,
        descricao: '',
        data: new Date(),
      })

      await fetchInteractions()
    } catch (error: any) {
      console.error('Error logging interaction:', error)
      toast({
        title: 'Erro ao registrar interação',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Reunião':
        return <Users className="h-4 w-4" />
      case 'Ligação':
        return <Phone className="h-4 w-4" />
      case 'E-mail':
        return <Mail className="h-4 w-4" />
      case 'WhatsApp':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl flex flex-col h-full overflow-hidden"
        side="right"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>Gestão de Lead: {lead?.company}</SheetTitle>
          <SheetDescription>
            Acompanhe o histórico e tarefas de {lead?.contactName}.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          defaultValue="interactions"
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="interactions" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Interações
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" /> Tarefas
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="interactions"
            className="flex-1 flex flex-col gap-6 overflow-hidden data-[state=inactive]:hidden"
          >
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h3 className="font-semibold text-sm mb-3">
                Registrar Nova Interação
              </h3>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Reunião">Reunião</SelectItem>
                              <SelectItem value="Ligação">Ligação</SelectItem>
                              <SelectItem value="E-mail">E-mail</SelectItem>
                              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              setDate={field.onChange}
                              className="bg-background"
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
                            placeholder="Resumo da interação..."
                            className="bg-background min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Registrar Interação
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            <Separator />

            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Linha do Tempo
              </h3>

              <ScrollArea className="flex-1 -mr-4 pr-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Carregando histórico...
                  </div>
                ) : interactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    <p>Nenhuma interação registrada.</p>
                  </div>
                ) : (
                  <div className="space-y-6 pl-2 relative border-l border-muted ml-2 pb-6">
                    {interactions.map((interaction) => (
                      <div key={interaction.id} className="relative pl-6">
                        <div className="absolute -left-[25px] top-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
                          {getIcon(interaction.tipo)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-medium">
                              {interaction.tipo}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(interaction.data),
                                "dd 'de' MMM, yyyy",
                                { locale: ptBR },
                              )}
                            </span>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap text-foreground/90">
                            {interaction.descricao}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">
                              Registrado por:{' '}
                              {interaction.user?.role || 'Usuário'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent
            value="tasks"
            className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <LeadTasksSection lead={lead} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

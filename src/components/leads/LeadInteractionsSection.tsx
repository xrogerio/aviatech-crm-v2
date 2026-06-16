import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  FileText,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InteractionFormDialog } from './InteractionFormDialog'
import {
  Interaction,
  interactionsService,
} from '@/services/interactionsService'
import { Lead } from '@/context/LeadsContext'

interface LeadInteractionsSectionProps {
  lead: Lead | null
}

const getInteractionIcon = (tipo: string) => {
  switch (tipo) {
    case 'WhatsApp':
      return <MessageCircle className="h-4 w-4 text-green-500" />
    case 'Ligação':
      return <Phone className="h-4 w-4 text-blue-500" />
    case 'Email':
      return <Mail className="h-4 w-4 text-red-500" />
    case 'Reunião':
      return <MessageSquare className="h-4 w-4 text-purple-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

export function LeadInteractionsSection({
  lead,
}: LeadInteractionsSectionProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const loadInteractions = useCallback(async () => {
    if (!lead?.id) return
    try {
      setIsLoading(true)
      const data = await interactionsService.getInteractionsByLead(lead.id)
      setInteractions(data)
    } catch (error) {
      console.error('Failed to load interactions', error)
    } finally {
      setIsLoading(false)
    }
  }, [lead?.id])

  useEffect(() => {
    loadInteractions()
  }, [loadInteractions])

  if (!lead) return null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 mt-2">
        <h3 className="text-lg font-medium">Interações</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Interação
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : interactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground border rounded-lg bg-muted/20">
            <MessageSquare className="h-8 w-8 mb-4 opacity-50" />
            <p className="text-sm font-medium">Nenhuma interação registrada.</p>
            <p className="text-xs mt-1">
              Registre a primeira interação com este lead.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {interactions.map((interaction) => (
              <div
                key={interaction.id}
                className="flex gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="mt-1 bg-muted p-2 rounded-full h-fit flex-shrink-0">
                  {getInteractionIcon(interaction.tipo)}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium">{interaction.tipo}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(
                        new Date(interaction.data),
                        "dd/MM/yyyy 'às' HH:mm",
                        {
                          locale: ptBR,
                        },
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {interaction.descricao}
                  </p>
                  {interaction.user && (
                    <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1 flex-wrap">
                      <span className="font-medium text-foreground">
                        {interaction.user.name || 'Usuário Desconhecido'}
                      </span>
                      {interaction.user.role && (
                        <span className="opacity-70 capitalize">
                          ({interaction.user.role})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <InteractionFormDialog
        leadId={lead.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadInteractions}
      />
    </div>
  )
}

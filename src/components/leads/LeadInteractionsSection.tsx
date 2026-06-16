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
  Pencil,
  Trash2,
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
import { useToast } from '@/hooks/use-toast'

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
  const [editingInteraction, setEditingInteraction] =
    useState<Interaction | null>(null)
  const [interactionToDelete, setInteractionToDelete] =
    useState<Interaction | null>(null)
  const { toast } = useToast()

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

  const handleEdit = (interaction: Interaction) => {
    setEditingInteraction(interaction)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!interactionToDelete) return
    try {
      await interactionsService.deleteInteraction(interactionToDelete.id)
      toast({ title: 'Interação excluída com sucesso' })
      setInteractionToDelete(null)
      loadInteractions()
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir interação',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (!lead) return null

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Interações</h3>
        <Button
          onClick={() => {
            setEditingInteraction(null)
            setIsDialogOpen(true)
          }}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Interação
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4 h-[500px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            <MessageSquare className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p>Nenhuma interação registrada.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {interactions.map((interaction) => (
              <div
                key={interaction.id}
                className="group flex gap-3 p-3 rounded-lg border bg-card transition-all hover:shadow-sm"
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
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleEdit(interaction)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setInteractionToDelete(interaction)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <InteractionFormDialog
        leadId={lead.id}
        interaction={editingInteraction}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingInteraction(null)
        }}
        onSuccess={loadInteractions}
      />

      <AlertDialog
        open={!!interactionToDelete}
        onOpenChange={(open) => !open && setInteractionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Interação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta interação? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

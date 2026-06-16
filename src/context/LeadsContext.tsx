import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type LeadStatus =
  | 'Novo Lead'
  | 'Qualificação'
  | 'Proposta Enviada'
  | 'Negociação'
  | 'Fechado Ganho'
  | 'Fechado Perdido'

export interface Proposal {
  id: string
  title: string
  valor: number
  status: string | null
}

export interface Lead {
  id: string
  company: string
  contactName: string
  email: string
  phone: string
  segment: string
  size: string
  origin: string
  status: LeadStatus
  createdAt: string
  createdBy: string
  proposals: Proposal[]
}

interface LeadsContextType {
  leads: Lead[]
  addLead: (
    lead: Omit<Lead, 'id' | 'createdAt' | 'createdBy' | 'proposals'>,
  ) => Promise<boolean>
  updateLead: (id: string, updates: Partial<Lead>) => Promise<boolean>
  deleteLead: (id: string) => Promise<void>
  loading: boolean
  refreshLeads: () => Promise<void>
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { organizationId, user } = useAuth()

  const fetchLeads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(
          `
          *,
          proposals (
            id,
            titulo,
            valor,
            status
          )
        `,
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const mappedLeads: Lead[] = data.map((dbLead: any) => ({
          id: dbLead.id,
          company: dbLead.empresa,
          contactName: dbLead.contato,
          email: dbLead.email || '',
          phone: dbLead.telefone || '',
          segment: dbLead.segmento || '',
          size: dbLead.tamanho || '',
          origin: dbLead.origem || '',
          status: dbLead.status as LeadStatus,
          createdAt: dbLead.created_at,
          createdBy: dbLead.created_by || '',
          proposals:
            dbLead.proposals?.map((p: any) => ({
              id: p.id,
              title: p.titulo,
              valor: p.valor || 0,
              status: p.status,
            })) || [],
        }))
        setLeads(mappedLeads)
      }
    } catch (error: any) {
      console.error('Error fetching leads:', error)
      toast({
        title: 'Erro ao carregar leads',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const handleProposalChange = useCallback(
    (payload: RealtimePostgresChangesPayload<any>) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      setLeads((currentLeads) => {
        return currentLeads.map((lead) => {
          // Handle INSERT: Add proposal to the correct lead
          if (eventType === 'INSERT' && newRecord.lead_id === lead.id) {
            const newProposal: Proposal = {
              id: newRecord.id,
              title: newRecord.titulo,
              valor: newRecord.valor || 0,
              status: newRecord.status,
            }
            // Avoid duplicates
            if (lead.proposals.some((p) => p.id === newProposal.id)) {
              return lead
            }
            return { ...lead, proposals: [...lead.proposals, newProposal] }
          }

          // Handle UPDATE: Update existing proposal or move it
          if (eventType === 'UPDATE') {
            const hasProposal = lead.proposals.some(
              (p) => p.id === newRecord.id,
            )

            // If this lead is the target of the update (or move)
            if (newRecord.lead_id === lead.id) {
              const updatedProposal: Proposal = {
                id: newRecord.id,
                title: newRecord.titulo,
                valor: newRecord.valor || 0,
                status: newRecord.status,
              }

              if (hasProposal) {
                // Update existing
                return {
                  ...lead,
                  proposals: lead.proposals.map((p) =>
                    p.id === newRecord.id ? updatedProposal : p,
                  ),
                }
              } else {
                // Moved to this lead
                return {
                  ...lead,
                  proposals: [...lead.proposals, updatedProposal],
                }
              }
            } else if (hasProposal && newRecord.lead_id !== lead.id) {
              // Moved AWAY from this lead
              return {
                ...lead,
                proposals: lead.proposals.filter((p) => p.id !== newRecord.id),
              }
            }
          }

          // Handle DELETE
          if (eventType === 'DELETE') {
            const hasProposal = lead.proposals.some(
              (p) => p.id === oldRecord.id,
            )
            if (hasProposal) {
              return {
                ...lead,
                proposals: lead.proposals.filter((p) => p.id !== oldRecord.id),
              }
            }
          }

          return lead
        })
      })
    },
    [],
  )

  useEffect(() => {
    if (!user) return

    fetchLeads()

    const channel = supabase
      .channel('public:leads-proposals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: organizationId
            ? `organization_id=eq.${organizationId}`
            : undefined,
        },
        () => {
          fetchLeads()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals',
          // We intentionally removed the filter here to rely on RLS and ensuring we catch all events
          // even if client-side organizationId is not perfectly synced yet.
          // Since we use RLS, we only receive proposals we are allowed to see.
        },
        (payload) => {
          handleProposalChange(payload)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, organizationId, fetchLeads, handleProposalChange])

  const addLead = async (
    newLead: Omit<Lead, 'id' | 'createdAt' | 'createdBy' | 'proposals'>,
  ) => {
    try {
      const dbLead = {
        empresa: newLead.company,
        contato: newLead.contactName,
        email: newLead.email,
        telefone: newLead.phone,
        segmento: newLead.segment,
        tamanho: newLead.size,
        origem: newLead.origin,
        status: newLead.status,
        created_by: user?.id,
        // organization_id will be set by DB default based on user or trigger
      }

      const { data, error } = await supabase
        .from('leads')
        .insert([dbLead])
        .select()
        .single()

      if (error) throw error

      if (data) {
        const mappedLead: Lead = {
          id: data.id,
          company: data.empresa,
          contactName: data.contato,
          email: data.email || '',
          phone: data.telefone || '',
          segment: data.segmento || '',
          size: data.tamanho || '',
          origin: data.origem || '',
          status: data.status as LeadStatus,
          createdAt: data.created_at,
          createdBy: data.created_by || user?.id || '',
          proposals: [],
        }
        setLeads((prev) => [mappedLead, ...prev])
        return true
      }
      return false
    } catch (error: any) {
      console.error('Error adding lead:', error)
      toast({
        title: 'Erro ao adicionar lead',
        description: error.message,
        variant: 'destructive',
      })
      return false
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)),
      )

      const dbUpdates: any = {}
      if (updates.company) dbUpdates.empresa = updates.company
      if (updates.contactName) dbUpdates.contato = updates.contactName
      if (updates.email) dbUpdates.email = updates.email
      if (updates.phone) dbUpdates.telefone = updates.phone
      if (updates.segment) dbUpdates.segmento = updates.segment
      if (updates.size) dbUpdates.tamanho = updates.size
      if (updates.origin) dbUpdates.origem = updates.origin
      if (updates.status) dbUpdates.status = updates.status

      const { error } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', id)

      if (error) {
        fetchLeads()
        throw error
      }

      return true
    } catch (error: any) {
      console.error('Error updating lead:', error)
      toast({
        title: 'Erro ao atualizar lead',
        description: error.message,
        variant: 'destructive',
      })
      return false
    }
  }

  const deleteLead = async (id: string) => {
    try {
      setLeads((prev) => prev.filter((lead) => lead.id !== id))

      const { error } = await supabase.from('leads').delete().eq('id', id)

      if (error) {
        fetchLeads()
        throw error
      }
    } catch (error: any) {
      console.error('Error deleting lead:', error)
      toast({
        title: 'Erro ao excluir lead',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <LeadsContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        loading,
        refreshLeads: fetchLeads,
      }}
    >
      {children}
    </LeadsContext.Provider>
  )
}

export const useLeads = () => {
  const context = useContext(LeadsContext)
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider')
  }
  return context
}

import { supabase } from '@/lib/supabase/client'

export interface Interaction {
  id: string
  lead_id: string | null
  user_id: string | null
  tipo: string
  descricao: string | null
  data: string
  user?: {
    name: string | null
    role: string | null
  } | null
}

export interface CreateInteractionDTO {
  lead_id: string
  tipo: string
  descricao: string
  data: string
}

export const interactionsService = {
  async getInteractionsByLead(leadId: string): Promise<Interaction[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('*, user:users(name, role)')
      .eq('lead_id', leadId)
      .order('data', { ascending: false })

    if (error) throw error

    // Transform single user object back to the expected type
    return (data || []).map((item: any) => ({
      ...item,
      user: Array.isArray(item.user) ? item.user[0] : item.user,
    })) as Interaction[]
  },

  async createInteraction(interaction: CreateInteractionDTO) {
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        lead_id: interaction.lead_id,
        tipo: interaction.tipo,
        descricao: interaction.descricao,
        data: interaction.data,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}

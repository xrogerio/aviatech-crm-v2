import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Interaction =
  Database['public']['Tables']['interactions']['Row'] & {
    user?: { name: string | null; role: string } | null
  }
export type CreateInteractionDTO =
  Database['public']['Tables']['interactions']['Insert']
export type UpdateInteractionDTO =
  Database['public']['Tables']['interactions']['Update']

export const interactionsService = {
  async getInteractionsByLead(leadId: string): Promise<Interaction[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('*, user:users(name, role)')
      .eq('lead_id', leadId)
      .order('data', { ascending: false })

    if (error) throw error
    return data as unknown as Interaction[]
  },

  async createInteraction(
    interaction: CreateInteractionDTO,
  ): Promise<Interaction> {
    const { data, error } = await supabase
      .from('interactions')
      .insert(interaction)
      .select('*, user:users(name, role)')
      .single()

    if (error) throw error
    return data as unknown as Interaction
  },

  async updateInteraction(
    id: string,
    updates: UpdateInteractionDTO,
  ): Promise<Interaction> {
    const { data, error } = await supabase
      .from('interactions')
      .update(updates)
      .eq('id', id)
      .select('*, user:users(name, role)')
      .single()

    if (error) throw error
    return data as unknown as Interaction
  },

  async deleteInteraction(id: string): Promise<void> {
    const { error } = await supabase.from('interactions').delete().eq('id', id)

    if (error) throw error
  },
}

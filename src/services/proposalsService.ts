import { supabase } from '@/lib/supabase/client'

export interface ProposalItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Proposal {
  id: string
  created_at: string
  created_by: string
  lead_id: string | null
  titulo: string
  status: 'Rascunho' | 'Enviada' | 'Aprovada' | 'Rejeitada'
  valor: number
  descricao?: string
  observacoes?: string
  validade?: string
  itens?: ProposalItem[]
  leads?: {
    empresa: string
    contato: string
    email: string
  }
}

export const proposalsService = {
  async getProposals() {
    const { data, error } = await supabase
      .from('proposals')
      .select(
        `
        *,
        leads (
          empresa,
          contato,
          email
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as Proposal[]
  },

  async createProposal(proposal: Partial<Proposal>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    // Fetch the user's organization_id to ensure explicit assignment
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('proposals')
      .insert([
        {
          ...proposal,
          created_by: user.id,
          organization_id: userData?.organization_id, // Explicitly set org id
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProposal(id: string, updates: Partial<Proposal>) {
    const { error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return true
  },

  async deleteProposal(id: string) {
    const { error } = await supabase.from('proposals').delete().eq('id', id)

    if (error) throw error
    return true
  },
}

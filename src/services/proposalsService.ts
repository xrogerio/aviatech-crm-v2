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
  project_id?: string | null
  company_id?: string | null
  signatory_id?: string | null
  signatory?: { name: string; cargo: string | null } | null
  company?: { razao_social: string; cnpj: string | null } | null
  leads?: {
    empresa: string
    contato: string
    email: string
    cargo: string | null
    cnpj: string | null
  }
  projects?: {
    name: string
  } | null
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
          email,
          cargo,
          cnpj
        ),
        projects (
          name
        ),
        signatory:users!proposals_signatory_id_fkey (
          name,
          cargo
        ),
        company:companies!proposals_company_id_fkey (
          razao_social,
          cnpj
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

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('proposals')
      .insert([
        {
          ...proposal,
          created_by: user.id,
          company_id: proposal.company_id || userData?.company_id || null,
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

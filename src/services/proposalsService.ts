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
  numero?: string | null
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
  company?: {
    razao_social: string
    cnpj: string | null
    logo_url?: string | null
  } | null
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
          cnpj,
          logo_url
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as Proposal[]
  },

  async generateNextProposalNumber(): Promise<string> {
    const { data, error } = await supabase.from('proposals').select('numero')

    if (error) {
      console.warn('Erro ao consultar números de propostas:', error)
    }

    const existingNumbers = new Set(
      (data || [])
        .map((p) => p.numero)
        .filter((num): num is string => Boolean(num)),
    )

    // Generate candidates between 0 and 999
    // Try random first (up to 1000 attempts)
    for (let i = 0; i < 1000; i++) {
      const rand = Math.floor(Math.random() * 1000)
      const candidate = `${rand}/2026`
      const paddedCandidate = `${rand.toString().padStart(3, '0')}/2026`
      if (
        !existingNumbers.has(candidate) &&
        !existingNumbers.has(paddedCandidate)
      ) {
        return candidate
      }
    }

    // Fallback: pick any unused number between 0 and 999
    const allCandidates: number[] = []
    for (let n = 0; n <= 999; n++) {
      const candidate = `${n}/2026`
      const paddedCandidate = `${n.toString().padStart(3, '0')}/2026`
      if (
        !existingNumbers.has(candidate) &&
        !existingNumbers.has(paddedCandidate)
      ) {
        allCandidates.push(n)
      }
    }

    if (allCandidates.length === 0) {
      throw new Error(
        'Não há mais números de proposta disponíveis entre 0 e 999 para 2026.',
      )
    }

    const picked =
      allCandidates[Math.floor(Math.random() * allCandidates.length)]
    return `${picked}/2026`
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

    // If numero is not provided, generate random non-repeating number between 0 and 999 followed by '/2026'
    let proposalNumber = proposal.numero
    if (!proposalNumber) {
      try {
        proposalNumber = await this.generateNextProposalNumber()
      } catch (err) {
        console.warn('Fallback to trigger for proposal number', err)
      }
    }

    const insertPayload: any = {
      ...proposal,
      ...(proposalNumber ? { numero: proposalNumber } : {}),
      created_by: user.id,
      company_id: proposal.company_id || userData?.company_id || null,
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert([insertPayload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProposal(id: string, updates: Partial<Proposal>) {
    const updatePayload: any = { ...updates }
    const { error } = await supabase
      .from('proposals')
      .update(updatePayload)
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

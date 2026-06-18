import { supabase } from '@/lib/supabase/client'

export interface Company {
  id: string
  razao_social: string | null
  cnpj: string | null
  responsavel_nome: string | null
  responsavel_cargo: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export const companiesService = {
  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('razao_social')

    if (error) throw error
    return data as Company[]
  },

  async createCompany(company: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single()

    if (error) throw error
    return data as Company
  },

  async updateCompany(id: string, updates: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Company
  },

  async deleteCompany(id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id)

    if (error) throw error
  },
}

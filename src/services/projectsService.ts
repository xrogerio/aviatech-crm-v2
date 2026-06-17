import { supabase } from '@/lib/supabase/client'

export interface Project {
  id: string
  name: string
  classification: string | null
  lead_id: string | null
  created_by: string | null
  created_at: string
  leads?: {
    empresa: string
  } | null
}

export type CreateProjectDTO = Omit<Project, 'id' | 'created_at' | 'leads'>

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*, leads(empresa)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as Project[]
  },

  async createProject(project: Partial<Project>): Promise<Project> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, created_by: user.id }])
      .select('*, leads(empresa)')
      .single()

    if (error) throw error
    return data as unknown as Project
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select('*, leads(empresa)')
      .single()

    if (error) throw error
    return data as unknown as Project
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
  },
}

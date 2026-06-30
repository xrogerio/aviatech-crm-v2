import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Task = Database['public']['Tables']['tasks']['Row'] & {
  leads?: { empresa: string } | null
  projects?: { name: string } | null
  project_id?: string | null
  created_at?: string
  updated_at?: string
}
export type CreateTaskDTO = Database['public']['Tables']['tasks']['Insert'] & {
  project_id?: string | null
}
export type UpdateTaskDTO = Database['public']['Tables']['tasks']['Update'] & {
  project_id?: string | null
}

export const tasksService = {
  async getTasksByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, leads(empresa), projects(name)')
      .eq('project_id', projectId)
      .order('prazo', { ascending: true })

    if (error) throw error
    return data as Task[]
  },

  async getTasks(userId?: string, excludeCompleted?: boolean): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*, leads(empresa), projects(name)')
      .order('prazo', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (excludeCompleted) {
      query = query.neq('status', 'Concluída')
    }

    const { data, error } = await query

    if (error) throw error
    return data as Task[]
  },

  async getTasksByLead(leadId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, leads(empresa), projects(name)')
      .eq('lead_id', leadId)
      .order('prazo', { ascending: true })

    if (error) throw error
    return data as Task[]
  },

  async createTask(task: CreateTaskDTO): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select('*, leads(empresa), projects(name)')
      .single()

    if (error) throw error
    return data as Task
  },

  async updateTask(id: string, updates: UpdateTaskDTO): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*, leads(empresa), projects(name)')
      .single()

    if (error) throw error
    return data as Task
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error
  },
}

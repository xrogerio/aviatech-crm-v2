import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Task = Database['public']['Tables']['tasks']['Row'] & {
  leads?: { empresa: string } | null
}
export type CreateTaskDTO = Database['public']['Tables']['tasks']['Insert']
export type UpdateTaskDTO = Database['public']['Tables']['tasks']['Update']

export const tasksService = {
  async getTasks(userId?: string): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*, leads(empresa)')
      .order('prazo', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Task[]
  },

  async getTasksByLead(leadId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, leads(empresa)')
      .eq('lead_id', leadId)
      .order('prazo', { ascending: true })

    if (error) throw error
    return data as Task[]
  },

  async createTask(task: CreateTaskDTO): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select('*, leads(empresa)')
      .single()

    if (error) throw error
    return data as Task
  },

  async updateTask(id: string, updates: UpdateTaskDTO): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*, leads(empresa)')
      .single()

    if (error) throw error
    return data as Task
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error
  },
}

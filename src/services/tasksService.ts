import { supabase } from '@/lib/supabase/client'

export interface Task {
  id: string
  titulo: string
  descricao: string | null
  prazo: string | null
  status: string | null
  lead_id: string | null
  user_id: string | null
  leads?: {
    empresa: string
    contato: string
  } | null
}

export type CreateTaskDTO = Omit<Task, 'id' | 'leads'>
export type UpdateTaskDTO = Partial<Omit<Task, 'id' | 'leads'>>

export const tasksService = {
  async getTasks(userId?: string) {
    let query = supabase
      .from('tasks')
      .select(
        `
        *,
        leads (
          empresa,
          contato
        )
      `,
      )
      .order('prazo', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Task[]
  },

  async getTasksByLead(leadId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('prazo', { ascending: true })

    if (error) throw error
    return data as Task[]
  },

  async createTask(task: CreateTaskDTO) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTask(id: string, updates: UpdateTaskDTO) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error
  },
}

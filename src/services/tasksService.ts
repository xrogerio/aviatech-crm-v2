import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type Task = Database['public']['Tables']['tasks']['Row']
export type CreateTaskDTO = Database['public']['Tables']['tasks']['Insert']
export type UpdateTaskDTO = Database['public']['Tables']['tasks']['Update']

export const tasksService = {
  async getTasksByLead(leadId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('prazo', { ascending: true })

    if (error) throw error
    return data as Task[]
  },

  async createTask(task: CreateTaskDTO): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error
    return data as Task
  },

  async updateTask(id: string, updates: UpdateTaskDTO): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Task
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error
  },
}

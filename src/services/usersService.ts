import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  role: 'vendedor' | 'gerente' | 'admin'
  email?: string
  name?: string
  organization_id?: string
}

export const usersService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data as UserProfile[]
  },

  async createUser(data: {
    email: string
    password: string
    role: string
    name: string
  }) {
    const { data: result, error } = await supabase.functions.invoke(
      'create-user',
      {
        body: data,
      },
    )

    if (error) throw error
    if (result.error) throw new Error(result.error)

    return result
  },

  async updateUserRole(id: string, role: string) {
    const { error } = await supabase.from('users').update({ role }).eq('id', id)

    if (error) throw error
    return true
  },

  async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id)

    if (error) throw error
    return true
  },
}

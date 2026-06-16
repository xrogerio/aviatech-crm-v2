// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      companies: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          razao_social: string | null
          responsavel_cargo: string | null
          responsavel_nome: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          razao_social?: string | null
          responsavel_cargo?: string | null
          responsavel_nome?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          razao_social?: string | null
          responsavel_cargo?: string | null
          responsavel_nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          data: string
          descricao: string | null
          id: string
          lead_id: string | null
          tipo: string
          user_id: string | null
        }
        Insert: {
          data?: string
          descricao?: string | null
          id?: string
          lead_id?: string | null
          tipo: string
          user_id?: string | null
        }
        Update: {
          data?: string
          descricao?: string | null
          id?: string
          lead_id?: string | null
          tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'interactions_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'interactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          cnpj: string
          contato: string
          created_at: string
          created_by: string | null
          email: string | null
          empresa: string
          endereco: string
          id: string
          segmento: string | null
          status: string
          telefone: string | null
        }
        Insert: {
          cnpj?: string
          contato: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          empresa: string
          endereco?: string
          id?: string
          segmento?: string | null
          status?: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string
          contato?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          empresa?: string
          endereco?: string
          id?: string
          segmento?: string | null
          status?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'leads_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_notifications_user_id'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      proposals: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          itens: Json | null
          lead_id: string | null
          numero: string | null
          observacoes: string | null
          status: string | null
          titulo: string
          validade: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          itens?: Json | null
          lead_id?: string | null
          numero?: string | null
          observacoes?: string | null
          status?: string | null
          titulo: string
          validade?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          itens?: Json | null
          lead_id?: string | null
          numero?: string | null
          observacoes?: string | null
          status?: string | null
          titulo?: string
          validade?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'proposals_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'proposals_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          descricao: string | null
          id: string
          lead_id: string | null
          prazo: string | null
          status: string | null
          titulo: string
          user_id: string | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          lead_id?: string | null
          prazo?: string | null
          status?: string | null
          titulo: string
          user_id?: string | null
        }
        Update: {
          descricao?: string | null
          id?: string
          lead_id?: string | null
          prazo?: string | null
          status?: string | null
          titulo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          email: string | null
          id: string
          name: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_or_manager: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: companies
//   id: uuid (not null, default: gen_random_uuid())
//   razao_social: text (nullable)
//   cnpj: text (nullable)
//   responsavel_nome: text (nullable)
//   responsavel_cargo: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   logo_url: text (nullable)
// Table: interactions
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   user_id: uuid (nullable, default: auth.uid())
//   tipo: text (not null)
//   descricao: text (nullable)
//   data: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   empresa: text (not null)
//   contato: text (not null)
//   email: text (nullable)
//   telefone: text (nullable)
//   segmento: text (nullable)
//   status: text (not null, default: 'Novo Lead'::text)
//   created_by: uuid (nullable, default: auth.uid())
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   cnpj: text (not null, default: ''::text)
//   endereco: text (not null, default: ''::text)
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   message: text (nullable)
//   type: text (nullable)
//   read: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: proposals
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   titulo: text (not null)
//   valor: numeric (nullable)
//   status: text (nullable, default: 'draft'::text)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   created_by: uuid (nullable, default: auth.uid())
//   descricao: text (nullable)
//   observacoes: text (nullable)
//   validade: timestamp with time zone (nullable)
//   itens: jsonb (nullable, default: '[]'::jsonb)
//   numero: text (nullable)
// Table: tasks
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   user_id: uuid (nullable, default: auth.uid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   prazo: timestamp with time zone (nullable)
//   status: text (nullable, default: 'pending'::text)
// Table: users
//   id: uuid (not null)
//   role: text (not null, default: 'vendedor'::text)
//   email: text (nullable)
//   name: text (nullable)
//   avatar_url: text (nullable)
//   company_id: uuid (nullable)

// --- CONSTRAINTS ---
// Table: companies
//   PRIMARY KEY companies_pkey: PRIMARY KEY (id)
// Table: interactions
//   FOREIGN KEY interactions_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY interactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY interactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id)
// Table: leads
//   FOREIGN KEY leads_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id)
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
// Table: notifications
//   FOREIGN KEY fk_notifications_user_id: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
// Table: proposals
//   FOREIGN KEY proposals_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id)
//   FOREIGN KEY proposals_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY proposals_pkey: PRIMARY KEY (id)
// Table: tasks
//   FOREIGN KEY tasks_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tasks_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id)
// Table: users
//   FOREIGN KEY users_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
//   CHECK users_role_check: CHECK ((role = ANY (ARRAY['vendedor'::text, 'gerente'::text, 'admin'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: companies
//   Policy "Admins and managers can update companies" (UPDATE, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'gerente'::text])))))
//   Policy "Admins can insert companies" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))
//   Policy "Anyone can view companies" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Authenticated users can select companies" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: interactions
//   Policy "Admins and Managers manage all interactions" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin_or_manager()
//   Policy "Authenticated users can select interactions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Vendedores manage own interactions" (ALL, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
// Table: leads
//   Policy "Admins and Managers manage all leads" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin_or_manager()
//   Policy "Authenticated users can select leads" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Vendedores delete own leads" (DELETE, PERMISSIVE) roles={public}
//     USING: (created_by = auth.uid())
//   Policy "Vendedores insert own leads" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (created_by = auth.uid())
//   Policy "Vendedores update own leads" (UPDATE, PERMISSIVE) roles={public}
//     USING: (created_by = auth.uid())
//   Policy "Vendedores view own leads" (SELECT, PERMISSIVE) roles={public}
//     USING: (created_by = auth.uid())
// Table: notifications
//   Policy "authenticated_delete_notifications" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "authenticated_select_notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "authenticated_update_notifications" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
// Table: proposals
//   Policy "Admins and Managers manage all proposals" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin_or_manager()
//   Policy "Authenticated users can select proposals" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Vendedores manage own proposals" (ALL, PERMISSIVE) roles={public}
//     USING: (created_by = auth.uid())
// Table: tasks
//   Policy "Admins and Managers manage all tasks" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin_or_manager()
//   Policy "Authenticated users can select tasks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Vendedores manage own tasks" (ALL, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
// Table: users
//   Policy "Admins and Managers can view all profiles" (SELECT, PERMISSIVE) roles={public}
//     USING: is_admin_or_manager()
//   Policy "Admins can delete users" (DELETE, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM users users_1   WHERE ((users_1.id = auth.uid()) AND (users_1.role = 'admin'::text))))
//   Policy "Admins can update users" (UPDATE, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM users users_1   WHERE ((users_1.id = auth.uid()) AND (users_1.role = 'admin'::text))))
//   Policy "Authenticated users can select users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.users (id, role, email, name)
//     VALUES (
//       NEW.id,
//       'vendedor',
//       NEW.email,
//       NEW.raw_user_meta_data->>'name'
//     );
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION is_admin_or_manager()
//   CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     current_user_id uuid;
//   BEGIN
//     -- Get current user ID safely from the JWT claim
//     current_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
//
//     -- If no user is logged in, return false
//     IF current_user_id IS NULL THEN
//       RETURN FALSE;
//     END IF;
//
//     -- Check role in users table
//     RETURN EXISTS (
//       SELECT 1 FROM users
//       WHERE id = current_user_id
//       AND role IN ('admin', 'gerente')
//     );
//   END;
//   $function$
//
// FUNCTION sync_user_details()
//   CREATE OR REPLACE FUNCTION public.sync_user_details()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.users
//     SET email = NEW.email,
//         name = NEW.raw_user_meta_data->>'name'
//     WHERE id = NEW.id;
//     RETURN NEW;
//   END;
//   $function$
//

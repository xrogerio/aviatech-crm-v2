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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      interactions: {
        Row: {
          data: string
          descricao: string | null
          id: string
          lead_id: string | null
          organization_id: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          data?: string
          descricao?: string | null
          id?: string
          lead_id?: string | null
          organization_id?: string
          tipo: string
          user_id?: string | null
        }
        Update: {
          data?: string
          descricao?: string | null
          id?: string
          lead_id?: string | null
          organization_id?: string
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
            foreignKeyName: 'interactions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
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
          contato: string
          created_at: string
          created_by: string | null
          email: string | null
          empresa: string
          id: string
          organization_id: string
          origem: string | null
          segmento: string | null
          status: string
          tamanho: string | null
          telefone: string | null
        }
        Insert: {
          contato: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          empresa: string
          id?: string
          organization_id?: string
          origem?: string | null
          segmento?: string | null
          status?: string
          tamanho?: string | null
          telefone?: string | null
        }
        Update: {
          contato?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          empresa?: string
          id?: string
          organization_id?: string
          origem?: string | null
          segmento?: string | null
          status?: string
          tamanho?: string | null
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
          {
            foreignKeyName: 'leads_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          organization_id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          organization_id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          organization_id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_org'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_user'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          itens: Json | null
          lead_id: string | null
          observacoes: string | null
          organization_id: string
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
          observacoes?: string | null
          organization_id?: string
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
          observacoes?: string | null
          organization_id?: string
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
          {
            foreignKeyName: 'proposals_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          descricao: string | null
          id: string
          lead_id: string | null
          organization_id: string
          prazo: string | null
          status: string | null
          titulo: string
          user_id: string | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          lead_id?: string | null
          organization_id?: string
          prazo?: string | null
          status?: string | null
          titulo: string
          user_id?: string | null
        }
        Update: {
          descricao?: string | null
          id?: string
          lead_id?: string | null
          organization_id?: string
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
            foreignKeyName: 'tasks_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
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
          email: string | null
          id: string
          name: string | null
          organization_id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          id: string
          name?: string | null
          organization_id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          id?: string
          name?: string | null
          organization_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_org_id: { Args: never; Returns: string }
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
// Table: interactions
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   user_id: uuid (nullable, default: auth.uid())
//   tipo: text (not null)
//   descricao: text (nullable)
//   data: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   organization_id: uuid (not null, default: get_my_org_id())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   empresa: text (not null)
//   contato: text (not null)
//   email: text (nullable)
//   telefone: text (nullable)
//   segmento: text (nullable)
//   tamanho: text (nullable)
//   origem: text (nullable)
//   status: text (not null, default: 'Novo Lead'::text)
//   created_by: uuid (nullable, default: auth.uid())
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   organization_id: uuid (not null, default: get_my_org_id())
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   message: text (not null)
//   read: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   organization_id: uuid (not null, default: get_my_org_id())
// Table: organizations
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
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
//   organization_id: uuid (not null, default: get_my_org_id())
// Table: tasks
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   user_id: uuid (nullable, default: auth.uid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   prazo: timestamp with time zone (nullable)
//   status: text (nullable, default: 'pending'::text)
//   organization_id: uuid (not null, default: get_my_org_id())
// Table: users
//   id: uuid (not null)
//   role: text (not null, default: 'vendedor'::text)
//   email: text (nullable)
//   name: text (nullable)
//   organization_id: uuid (not null)
//   avatar_url: text (nullable)

// --- CONSTRAINTS ---
// Table: interactions
//   FOREIGN KEY interactions_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   FOREIGN KEY interactions_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id)
//   PRIMARY KEY interactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY interactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id)
// Table: leads
//   FOREIGN KEY leads_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id)
//   FOREIGN KEY leads_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id)
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
// Table: notifications
//   FOREIGN KEY fk_org: FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
//   FOREIGN KEY fk_user: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
// Table: organizations
//   PRIMARY KEY organizations_pkey: PRIMARY KEY (id)
// Table: proposals
//   FOREIGN KEY proposals_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id)
//   FOREIGN KEY proposals_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   FOREIGN KEY proposals_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id)
//   PRIMARY KEY proposals_pkey: PRIMARY KEY (id)
// Table: tasks
//   FOREIGN KEY tasks_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   FOREIGN KEY tasks_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id)
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tasks_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id)
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY users_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id)
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
//   CHECK users_role_check: CHECK ((role = ANY (ARRAY['vendedor'::text, 'gerente'::text, 'admin'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: interactions
//   Policy "Manage Interactions Policy" (ALL, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())
//   Policy "View Interactions Policy" (SELECT, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())
// Table: leads
//   Policy "Delete Leads Policy" (DELETE, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND (is_admin_or_manager() OR (created_by = auth.uid())))
//   Policy "Insert Leads Policy" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: ((organization_id = get_my_org_id()) AND (is_admin_or_manager() OR (created_by = auth.uid())))
//   Policy "Update Leads Policy" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND (is_admin_or_manager() OR (created_by = auth.uid())))
//   Policy "View Leads Policy" (SELECT, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND (is_admin_or_manager() OR (created_by = auth.uid())))
// Table: notifications
//   Policy "Delete Notifications Policy" (DELETE, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND (user_id = auth.uid()))
//   Policy "Insert Notifications Policy" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (organization_id = get_my_org_id())
//   Policy "Update Notifications Policy" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND (user_id = auth.uid()))
//   Policy "View Notifications Policy" (SELECT, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND (user_id = auth.uid()))
// Table: organizations
//   Policy "Admins and Managers can update organizations" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((id = get_my_org_id()) AND is_admin_or_manager())
//     WITH CHECK: ((id = get_my_org_id()) AND is_admin_or_manager())
//   Policy "Users can view their own organization" (SELECT, PERMISSIVE) roles={public}
//     USING: (id = get_my_org_id())
// Table: proposals
//   Policy "Delete Proposals Policy" (DELETE, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())
//   Policy "Insert Proposals Policy" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (organization_id = get_my_org_id())
//   Policy "Update Proposals Policy" (UPDATE, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())
//   Policy "View Proposals Policy" (SELECT, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())
// Table: tasks
//   Policy "Manage Tasks Policy" (ALL, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())
//   Policy "View Tasks Policy" (SELECT, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())
// Table: users
//   Policy "Admins and Managers can delete users" (DELETE, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND is_admin_or_manager())
//   Policy "Admins and Managers can update users" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((organization_id = get_my_org_id()) AND is_admin_or_manager())
//   Policy "Users can update their own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
//   Policy "View Users Policy" (SELECT, PERMISSIVE) roles={public}
//     USING: (organization_id = get_my_org_id())

// --- DATABASE FUNCTIONS ---
// FUNCTION get_my_org_id()
//   CREATE OR REPLACE FUNCTION public.get_my_org_id()
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     org_id UUID;
//   BEGIN
//     SELECT organization_id INTO org_id
//     FROM public.users
//     WHERE id = auth.uid();
//     RETURN org_id;
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     org_id UUID;
//     org_name TEXT;
//     user_role TEXT;
//   BEGIN
//     -- Check if organization_id is provided in metadata (Invitation/Admin creation)
//     IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
//       org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
//       user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor');
//     ELSE
//       -- Create new organization for new signup
//       org_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Organização');
//       INSERT INTO public.organizations (name) VALUES (org_name) RETURNING id INTO org_id;
//       user_role := 'admin'; -- Creator is admin
//     END IF;
//
//     INSERT INTO public.users (id, role, organization_id)
//     VALUES (NEW.id, user_role, org_id);
//
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
//   BEGIN
//     -- Check if the current user has admin or manager role
//     -- Using auth.uid() is the standard way to get current user ID in Supabase
//     RETURN EXISTS (
//       SELECT 1 FROM public.users
//       WHERE id = auth.uid()
//       AND role IN ('admin', 'gerente')
//     );
//   END;
//   $function$
//
// FUNCTION set_proposal_organization_id()
//   CREATE OR REPLACE FUNCTION public.set_proposal_organization_id()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.organization_id IS NULL THEN
//       SELECT organization_id INTO NEW.organization_id
//       FROM public.leads
//       WHERE id = NEW.lead_id;
//     END IF;
//     RETURN NEW;
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

// --- TRIGGERS ---
// Table: proposals
//   set_proposal_organization_id_trigger: CREATE TRIGGER set_proposal_organization_id_trigger BEFORE INSERT ON public.proposals FOR EACH ROW EXECUTE FUNCTION set_proposal_organization_id()

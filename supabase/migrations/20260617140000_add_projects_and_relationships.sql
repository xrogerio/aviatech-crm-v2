CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    classification TEXT,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can select projects" ON public.projects;
CREATE POLICY "Authenticated users can select projects" ON public.projects
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins and Managers manage all projects" ON public.projects;
CREATE POLICY "Admins and Managers manage all projects" ON public.projects
    FOR ALL TO public USING (is_admin_or_manager());

DROP POLICY IF EXISTS "Vendedores manage own projects" ON public.projects;
CREATE POLICY "Vendedores manage own projects" ON public.projects
    FOR ALL TO public USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_id AND leads.created_by = auth.uid())
    );

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lacerdarogerio1@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'lacerdarogerio1@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, name, role)
    VALUES (new_user_id, 'lacerdarogerio1@gmail.com', 'Administrador', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Administrador';
  END IF;
END $$;

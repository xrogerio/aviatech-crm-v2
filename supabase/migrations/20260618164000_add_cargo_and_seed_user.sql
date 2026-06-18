-- Add cargo columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cargo TEXT;

-- Seed user lacerdarogerio1@gmail.com
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
      '{"name": "Rogério Lacerda"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, name, role)
    VALUES (new_user_id, 'lacerdarogerio1@gmail.com', 'Rogério Lacerda', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Ensure RLS policies exist for authenticated users to view data
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can select users" ON public.users;
  CREATE POLICY "Authenticated users can select users" ON public.users FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Authenticated users can select leads" ON public.leads;
  CREATE POLICY "Authenticated users can select leads" ON public.leads FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Authenticated users can select companies" ON public.companies;
  CREATE POLICY "Authenticated users can select companies" ON public.companies FOR SELECT TO authenticated USING (true);
END $$;

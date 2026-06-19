-- Seed the user
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
      '{"name": "Rogerio Lacerda"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, name, role)
    VALUES (new_user_id, 'lacerdarogerio1@gmail.com', 'Rogerio Lacerda', 'vendedor')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Backfill and ensure unique constraint
DO $$
BEGIN
  -- Backfill existing proposals with a dummy unique number if null
  UPDATE public.proposals SET numero = 'MIG-' || substring(id::text from 1 for 8) WHERE numero IS NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposals_numero_key'
  ) THEN
    ALTER TABLE public.proposals ADD CONSTRAINT proposals_numero_key UNIQUE (numero);
  END IF;
END $$;

-- Create function to auto-generate numbering
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS trigger AS $$
DECLARE
  current_year TEXT;
  current_max INT;
  next_num INT;
BEGIN
  current_year := to_char(NOW(), 'YYYY');
  
  -- Find the max number for the current year, correctly parsing as integer
  SELECT MAX(CAST(SPLIT_PART(numero, '/', 1) AS INT)) INTO current_max
  FROM public.proposals
  WHERE numero ~ ('^[0-9]+/' || current_year || '$');

  IF current_max IS NULL THEN
    next_num := 9; -- Start at 009
  ELSE
    next_num := current_max + 1;
  END IF;

  -- Ensure it's at least 3 digits
  NEW.numero := LPAD(next_num::TEXT, 3, '0') || '/' || current_year;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up the trigger
DROP TRIGGER IF EXISTS set_proposal_number ON public.proposals;
CREATE TRIGGER set_proposal_number
BEFORE INSERT ON public.proposals
FOR EACH ROW
WHEN (NEW.numero IS NULL OR NEW.numero = '')
EXECUTE FUNCTION public.generate_proposal_number();

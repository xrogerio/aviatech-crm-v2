-- 1. Update is_admin_or_manager() to use auth.uid() robustly
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    -- Fallback to JWT claim if auth.uid() is not populated
    current_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  END IF;

  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = current_user_id
    AND role IN ('admin', 'gerente')
  );
END;
$$;

-- 2. Ensure RLS policies on public.proposals allow Admins and Managers to perform all actions
DROP POLICY IF EXISTS "Admins and Managers manage all proposals" ON public.proposals;
CREATE POLICY "Admins and Managers manage all proposals" ON public.proposals
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_manager()
    OR (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) IN ('admin', 'gerente')
  )
  WITH CHECK (
    public.is_admin_or_manager()
    OR (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) IN ('admin', 'gerente')
  );

-- 3. Proposal number generator: random integer between 0 and 999 followed by '/2026'
-- Never repeating existing proposal numbers in the database
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS trigger AS $$
DECLARE
  candidate_num INT;
  candidate_str TEXT;
  attempts INT := 0;
  max_attempts INT := 1000;
BEGIN
  LOOP
    attempts := attempts + 1;
    IF attempts > max_attempts THEN
      -- If 0-999 is exhausted or high collision rate, fallback to picking first available unused number
      SELECT num INTO candidate_num
      FROM generate_series(0, 999) AS g(num)
      WHERE NOT EXISTS (
        SELECT 1 FROM public.proposals
        WHERE numero = (g.num::TEXT || '/2026')
           OR numero = (LPAD(g.num::TEXT, 3, '0') || '/2026')
      )
      ORDER BY random()
      LIMIT 1;

      IF candidate_num IS NULL THEN
        RAISE EXCEPTION 'Não há mais números disponíveis entre 0 e 999 para o ano de 2026.';
      END IF;

      NEW.numero := candidate_num::TEXT || '/2026';
      EXIT;
    END IF;

    -- Generate random integer between 0 and 999
    candidate_num := floor(random() * 1000)::INT;
    candidate_str := candidate_num::TEXT || '/2026';

    -- Check if this number already exists (checking both exact representation and 3-digit padded version)
    IF NOT EXISTS (
      SELECT 1 FROM public.proposals
      WHERE numero = candidate_str
         OR numero = (LPAD(candidate_num::TEXT, 3, '0') || '/2026')
    ) THEN
      NEW.numero := candidate_str;
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-create trigger for proposals number generation on insert
DROP TRIGGER IF EXISTS set_proposal_number ON public.proposals;
CREATE TRIGGER set_proposal_number
BEFORE INSERT ON public.proposals
FOR EACH ROW
WHEN (NEW.numero IS NULL OR NEW.numero = '')
EXECUTE FUNCTION public.generate_proposal_number();

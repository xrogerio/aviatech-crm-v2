DO $$
BEGIN
  -- Ensure RLS is enabled on the companies table
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

  -- Ensure authenticated users can select companies to fetch branding information
  DROP POLICY IF EXISTS "Authenticated users can select companies" ON public.companies;
  CREATE POLICY "Authenticated users can select companies" ON public.companies
    FOR SELECT TO authenticated USING (true);
END $$;

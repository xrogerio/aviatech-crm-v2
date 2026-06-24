-- Ensure RLS is enabled and policies exist for interactions
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Select policy
  DROP POLICY IF EXISTS "Authenticated users can select interactions" ON public.interactions;
  CREATE POLICY "Authenticated users can select interactions" ON public.interactions
    FOR SELECT TO authenticated USING (true);

  -- Insert policy
  DROP POLICY IF EXISTS "Authenticated users can insert interactions" ON public.interactions;
  CREATE POLICY "Authenticated users can insert interactions" ON public.interactions
    FOR INSERT TO authenticated WITH CHECK (true);

  -- Update policy
  DROP POLICY IF EXISTS "Authenticated users can update interactions" ON public.interactions;
  CREATE POLICY "Authenticated users can update interactions" ON public.interactions
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

  -- Delete policy
  DROP POLICY IF EXISTS "Authenticated users can delete interactions" ON public.interactions;
  CREATE POLICY "Authenticated users can delete interactions" ON public.interactions
    FOR DELETE TO authenticated USING (true);
END $$;

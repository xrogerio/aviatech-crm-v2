-- Drop older specific policy if it exists to replace with a broader one for ownership
DROP POLICY IF EXISTS "Vendedores manage own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users manage own proposals" ON public.proposals;

-- Allow authenticated users to manage their own proposals or proposals from their company
CREATE POLICY "Users manage own proposals" ON public.proposals
  FOR ALL TO authenticated
  USING (
    created_by = auth.uid()
    OR company_id = (SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    created_by = auth.uid()
    OR company_id = (SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

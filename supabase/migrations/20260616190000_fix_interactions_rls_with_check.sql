-- Fix interactions RLS to include explicit WITH CHECK for INSERT operations
DROP POLICY IF EXISTS "Vendedores manage own interactions" ON public.interactions;
CREATE POLICY "Vendedores manage own interactions" ON public.interactions
  FOR ALL
  TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins and Managers manage all interactions" ON public.interactions;
CREATE POLICY "Admins and Managers manage all interactions" ON public.interactions
  FOR ALL
  TO public
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

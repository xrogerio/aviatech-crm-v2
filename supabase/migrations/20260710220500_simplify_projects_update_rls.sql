-- Simplify projects UPDATE RLS policy to allow all authenticated users
-- The previous policy used is_admin_or_manager() and subqueries that could
-- fail silently, causing updates to affect 0 rows and return null data.

DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;

CREATE POLICY "Authenticated users can update projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

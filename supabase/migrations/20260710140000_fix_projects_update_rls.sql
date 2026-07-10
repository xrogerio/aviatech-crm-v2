-- Ensure RLS policies allow authenticated users to UPDATE projects
-- This fixes the PGRST116 error when updating project status in the Pipeline

-- Drop existing potentially restrictive policies
DROP POLICY IF EXISTS "Authenticated users can select projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and Managers manage all projects" ON public.projects;
DROP POLICY IF EXISTS "Vendedores manage own projects" ON public.projects;

-- SELECT: All authenticated users can view all projects
CREATE POLICY "Authenticated users can select projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

-- INSERT: Admins/managers can insert any; vendedores insert own
CREATE POLICY "Authenticated users can insert projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE: Admins/managers update any; vendedores update own projects
CREATE POLICY "Authenticated users can update projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (
    is_admin_or_manager()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = projects.lead_id
      AND leads.created_by = auth.uid()
    )
  )
  WITH CHECK (
    is_admin_or_manager()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = projects.lead_id
      AND leads.created_by = auth.uid()
    )
  );

-- DELETE: Admins/managers delete any; vendedores delete own
CREATE POLICY "Authenticated users can delete projects" ON public.projects
  FOR DELETE TO authenticated
  USING (
    is_admin_or_manager()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = projects.lead_id
      AND leads.created_by = auth.uid()
    )
  );

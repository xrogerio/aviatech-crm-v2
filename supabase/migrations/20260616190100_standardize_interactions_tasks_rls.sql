DO $$
BEGIN
  -- Interactions RLS
  DROP POLICY IF EXISTS "Admins and Managers manage all interactions" ON public.interactions;
  DROP POLICY IF EXISTS "Authenticated users can select interactions" ON public.interactions;
  DROP POLICY IF EXISTS "Vendedores manage own interactions" ON public.interactions;
  DROP POLICY IF EXISTS "Authenticated users can insert interactions" ON public.interactions;
  DROP POLICY IF EXISTS "Authenticated users can update interactions" ON public.interactions;
  DROP POLICY IF EXISTS "Authenticated users can delete interactions" ON public.interactions;

  CREATE POLICY "Authenticated users can select interactions" ON public.interactions
    FOR SELECT TO authenticated USING (true);
    
  CREATE POLICY "Authenticated users can insert interactions" ON public.interactions
    FOR INSERT TO authenticated WITH CHECK (true);
    
  CREATE POLICY "Authenticated users can update interactions" ON public.interactions
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    
  CREATE POLICY "Authenticated users can delete interactions" ON public.interactions
    FOR DELETE TO authenticated USING (true);

  -- Tasks RLS
  DROP POLICY IF EXISTS "Admins and Managers manage all tasks" ON public.tasks;
  DROP POLICY IF EXISTS "Authenticated users can select tasks" ON public.tasks;
  DROP POLICY IF EXISTS "Vendedores manage own tasks" ON public.tasks;
  DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
  DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
  DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;

  CREATE POLICY "Authenticated users can select tasks" ON public.tasks
    FOR SELECT TO authenticated USING (true);
    
  CREATE POLICY "Authenticated users can insert tasks" ON public.tasks
    FOR INSERT TO authenticated WITH CHECK (true);
    
  CREATE POLICY "Authenticated users can update tasks" ON public.tasks
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    
  CREATE POLICY "Authenticated users can delete tasks" ON public.tasks
    FOR DELETE TO authenticated USING (true);
END $$;

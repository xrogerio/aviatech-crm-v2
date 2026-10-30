-- Fix RLS recursion across public schema
-- Problem: Policies referencing public.users directly via subqueries (e.g. EXISTS (SELECT 1 FROM users ...))
-- while policies on public.users also execute, triggering PostgreSQL error 42P17 (infinite recursion detected).
-- Solution:
-- 1. Provide SECURITY DEFINER functions to look up user attributes (role, company_id, organization_id, admin/manager status)
--    without triggering RLS evaluation on public.users.
-- 2. Drop the recursive policies and recreate them using these SECURITY DEFINER helper functions.

-- 1. Helper functions (SECURITY DEFINER with explicit search_path)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_role text;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    current_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  END IF;

  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO user_role
  FROM public.users
  WHERE id = current_user_id;

  RETURN user_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  comp_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    current_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  END IF;

  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT company_id INTO comp_id
  FROM public.users
  WHERE id = current_user_id;

  RETURN comp_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
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
    current_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  END IF;

  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = current_user_id
    AND role = 'admin'
  );
END;
$$;

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

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  org_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    current_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  END IF;

  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT organization_id INTO org_id
  FROM public.users
  WHERE id = current_user_id;

  RETURN org_id;
END;
$$;

-- Grant execution permissions on helper functions
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_company_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO anon, authenticated, service_role;

-- 2. Fix policies on public.users
DROP POLICY IF EXISTS "Admins and Managers can view all profiles" ON public.users;
CREATE POLICY "Admins and Managers can view all profiles" ON public.users
  FOR SELECT
  USING (public.is_admin_or_manager());

-- 3. Fix policies on public.companies
DROP POLICY IF EXISTS "Admins can insert companies" ON public.companies;
CREATE POLICY "Admins can insert companies" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;
CREATE POLICY "Admins can update companies" ON public.companies
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;
CREATE POLICY "Admins can delete companies" ON public.companies
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 4. Fix policies on public.leads
DROP POLICY IF EXISTS "Admins and Managers manage all leads" ON public.leads;
CREATE POLICY "Admins and Managers manage all leads" ON public.leads
  FOR ALL
  USING (public.is_admin_or_manager());

-- 5. Fix policies on public.proposals
DROP POLICY IF EXISTS "Admins and Managers manage all proposals" ON public.proposals;
CREATE POLICY "Admins and Managers manage all proposals" ON public.proposals
  FOR ALL
  USING (public.is_admin_or_manager());

DROP POLICY IF EXISTS "Users manage own proposals" ON public.proposals;
CREATE POLICY "Users manage own proposals" ON public.proposals
  FOR ALL TO authenticated
  USING (
    created_by = auth.uid() OR company_id = public.get_current_user_company_id()
  )
  WITH CHECK (
    created_by = auth.uid() OR company_id = public.get_current_user_company_id()
  );

-- 6. Fix policies on public.interactions
DROP POLICY IF EXISTS "Admins and Managers manage all interactions" ON public.interactions;
CREATE POLICY "Admins and Managers manage all interactions" ON public.interactions
  FOR ALL
  USING (public.is_admin_or_manager());

-- 7. Fix policies on public.tasks
DROP POLICY IF EXISTS "Admins and Managers manage all tasks" ON public.tasks;
CREATE POLICY "Admins and Managers manage all tasks" ON public.tasks
  FOR ALL
  USING (public.is_admin_or_manager());

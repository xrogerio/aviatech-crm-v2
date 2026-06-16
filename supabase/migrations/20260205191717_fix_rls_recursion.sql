-- Create a secure function to check for admin/manager role
-- This function uses SECURITY DEFINER to bypass RLS on the users table
-- to avoid infinite recursion when policies query the users table.
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user ID safely from the JWT claim
  current_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  
  -- If no user is logged in, return false
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check role in users table
  -- Since this function is SECURITY DEFINER, it runs with the privileges of the owner (postgres),
  -- bypassing the RLS on the 'users' table which caused the recursion loop.
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = current_user_id
    AND role IN ('admin', 'gerente')
  );
END;
$$;

-- Update Users Policies
DROP POLICY IF EXISTS "Admins and Managers can view all profiles" ON public.users;

CREATE POLICY "Admins and Managers can view all profiles" ON public.users
  FOR SELECT USING (public.is_admin_or_manager());

-- Update Leads Policies
DROP POLICY IF EXISTS "Admins and Managers manage all leads" ON public.leads;

CREATE POLICY "Admins and Managers manage all leads" ON public.leads
  USING (public.is_admin_or_manager());

-- Update Interactions Policies
DROP POLICY IF EXISTS "Admins and Managers manage all interactions" ON public.interactions;

CREATE POLICY "Admins and Managers manage all interactions" ON public.interactions
  USING (public.is_admin_or_manager());

-- Update Tasks Policies
DROP POLICY IF EXISTS "Admins and Managers manage all tasks" ON public.tasks;

CREATE POLICY "Admins and Managers manage all tasks" ON public.tasks
  USING (public.is_admin_or_manager());

-- Update Proposals Policies
DROP POLICY IF EXISTS "Admins and Managers manage all proposals" ON public.proposals;

CREATE POLICY "Admins and Managers manage all proposals" ON public.proposals
  USING (public.is_admin_or_manager());

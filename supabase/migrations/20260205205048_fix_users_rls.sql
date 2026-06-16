-- Fix infinite recursion in RLS policies for users table

-- Drop the recursive policies that were causing issues
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Create new policies using the safe SECURITY DEFINER function
-- This allows Admins (and Managers) to update and delete users without triggering recursion
-- The function public.is_admin_or_manager() bypasses RLS safely to check roles

CREATE POLICY "Admins and Managers can update users" ON public.users
  FOR UPDATE
  USING (public.is_admin_or_manager());

CREATE POLICY "Admins and Managers can delete users" ON public.users
  FOR DELETE
  USING (public.is_admin_or_manager());

-- Ensure the SELECT policy is also correct and uses the function (reinforcing)
DROP POLICY IF EXISTS "Admins and Managers can view all profiles" ON public.users;

CREATE POLICY "Admins and Managers can view all profiles" ON public.users
  FOR SELECT
  USING (public.is_admin_or_manager());

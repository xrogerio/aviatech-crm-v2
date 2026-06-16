-- Consolidate SELECT policy for users table
-- This migration drops conflicting/redundant policies and creates a single unified policy
-- that allows Admins/Managers to view all profiles, and regular users to view their own.

-- Drop existing policies that might conflict or are being replaced
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins and Managers can view all profiles" ON public.users;
DROP POLICY IF EXISTS "View Users Policy" ON public.users;

-- Create the unified SELECT policy
-- Uses the SECURITY DEFINER function is_admin_or_manager() to avoid infinite recursion
CREATE POLICY "View Users Policy" ON public.users
  FOR SELECT
  USING (
    public.is_admin_or_manager() OR 
    auth.uid() = id
  );

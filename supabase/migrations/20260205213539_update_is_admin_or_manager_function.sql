-- Update is_admin_or_manager function to use auth.uid() standard helper
-- This improves reliability and standardizes the user ID retrieval
-- Maintains SECURITY DEFINER and search_path = public for security

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has admin or manager role
  -- Using auth.uid() is the standard way to get current user ID in Supabase
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'gerente')
  );
END;
$$;

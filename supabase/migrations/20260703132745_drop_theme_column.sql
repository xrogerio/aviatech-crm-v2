-- Remove theme column from users table if it was previously added
ALTER TABLE public.users DROP COLUMN IF EXISTS theme;

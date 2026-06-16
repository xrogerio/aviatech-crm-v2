CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Ensure columns exist in case the table was partially created previously
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.notifications ALTER COLUMN read SET DEFAULT false;
ALTER TABLE public.notifications ALTER COLUMN created_at SET DEFAULT now();

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Clean up any potential conflicting old policies
DROP POLICY IF EXISTS "View Notifications Policy" ON public.notifications;
DROP POLICY IF EXISTS "Update Notifications Policy" ON public.notifications;
DROP POLICY IF EXISTS "Insert Notifications Policy" ON public.notifications;
DROP POLICY IF EXISTS "Delete Notifications Policy" ON public.notifications;

-- Drop new policies to remain idempotent
DROP POLICY IF EXISTS "authenticated_select_notifications" ON public.notifications;
DROP POLICY IF EXISTS "authenticated_update_notifications" ON public.notifications;
DROP POLICY IF EXISTS "authenticated_delete_notifications" ON public.notifications;

-- Create policies for authenticated users
CREATE POLICY "authenticated_select_notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "authenticated_update_notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID NOT NULL DEFAULT public.get_my_org_id(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_org FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View Notifications Policy" ON public.notifications;
CREATE POLICY "View Notifications Policy" ON public.notifications
  FOR SELECT TO public USING (organization_id = get_my_org_id() AND user_id = auth.uid());

DROP POLICY IF EXISTS "Update Notifications Policy" ON public.notifications;
CREATE POLICY "Update Notifications Policy" ON public.notifications
  FOR UPDATE TO public USING (organization_id = get_my_org_id() AND user_id = auth.uid());

DROP POLICY IF EXISTS "Insert Notifications Policy" ON public.notifications;
CREATE POLICY "Insert Notifications Policy" ON public.notifications
  FOR INSERT TO public WITH CHECK (organization_id = get_my_org_id());

DROP POLICY IF EXISTS "Delete Notifications Policy" ON public.notifications;
CREATE POLICY "Delete Notifications Policy" ON public.notifications
  FOR DELETE TO public USING (organization_id = get_my_org_id() AND user_id = auth.uid());

DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
BEGIN
  -- Insert a welcome notification for the first available user as an example
  SELECT id, organization_id INTO v_user_id, v_org_id FROM public.users LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, organization_id)
    VALUES (
      v_user_id, 
      'Bem-vindo ao sistema de Notificações!', 
      'Você acaba de receber sua primeira notificação inteligente.', 
      v_org_id
    );
  END IF;
END $$;

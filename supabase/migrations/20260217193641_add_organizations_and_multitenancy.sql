-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org id (Bypassing RLS for internal use in defaults/policies)
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.users
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$;

-- Create default organization and migrate existing data
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- 1. Create default organization if not exists (or create a new one for migration)
  INSERT INTO public.organizations (name)
  VALUES ('Default Organization')
  RETURNING id INTO default_org_id;

  -- 2. Update Users Table
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  UPDATE public.users SET organization_id = default_org_id WHERE organization_id IS NULL;
  ALTER TABLE public.users ALTER COLUMN organization_id SET NOT NULL;

  -- 3. Update Leads Table
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  ALTER TABLE public.leads ALTER COLUMN organization_id SET DEFAULT public.get_my_org_id();
  UPDATE public.leads SET organization_id = default_org_id WHERE organization_id IS NULL;
  ALTER TABLE public.leads ALTER COLUMN organization_id SET NOT NULL;

  -- 4. Update Interactions Table
  ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  ALTER TABLE public.interactions ALTER COLUMN organization_id SET DEFAULT public.get_my_org_id();
  UPDATE public.interactions SET organization_id = default_org_id WHERE organization_id IS NULL;
  ALTER TABLE public.interactions ALTER COLUMN organization_id SET NOT NULL;

  -- 5. Update Tasks Table
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  ALTER TABLE public.tasks ALTER COLUMN organization_id SET DEFAULT public.get_my_org_id();
  UPDATE public.tasks SET organization_id = default_org_id WHERE organization_id IS NULL;
  ALTER TABLE public.tasks ALTER COLUMN organization_id SET NOT NULL;

  -- 6. Update Proposals Table
  ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
  ALTER TABLE public.proposals ALTER COLUMN organization_id SET DEFAULT public.get_my_org_id();
  UPDATE public.proposals SET organization_id = default_org_id WHERE organization_id IS NULL;
  ALTER TABLE public.proposals ALTER COLUMN organization_id SET NOT NULL;

END $$;

-- Update handle_new_user function to handle organization creation/assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
  user_role TEXT;
BEGIN
  -- Check if organization_id is provided in metadata (Invitation/Admin creation)
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor');
  ELSE
    -- Create new organization for new signup
    org_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Organização');
    INSERT INTO public.organizations (name) VALUES (org_name) RETURNING id INTO org_id;
    user_role := 'admin'; -- Creator is admin
  END IF;

  INSERT INTO public.users (id, role, organization_id)
  VALUES (NEW.id, user_role, org_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies Update

-- Organizations Policy
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (id = public.get_my_org_id());

-- Users Policies
DROP POLICY IF EXISTS "View Users Policy" ON public.users;
CREATE POLICY "View Users Policy" ON public.users
  FOR SELECT
  USING (organization_id = public.get_my_org_id());

DROP POLICY IF EXISTS "Admins and Managers can update users" ON public.users;
CREATE POLICY "Admins and Managers can update users" ON public.users
  FOR UPDATE
  USING (
    organization_id = public.get_my_org_id() AND
    public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "Admins and Managers can delete users" ON public.users;
CREATE POLICY "Admins and Managers can delete users" ON public.users
  FOR DELETE
  USING (
    organization_id = public.get_my_org_id() AND
    public.is_admin_or_manager()
  );

-- Leads Policies
DROP POLICY IF EXISTS "Admins and Managers manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Vendedores view own leads" ON public.leads;
DROP POLICY IF EXISTS "Vendedores insert own leads" ON public.leads;
DROP POLICY IF EXISTS "Vendedores update own leads" ON public.leads;
DROP POLICY IF EXISTS "Vendedores delete own leads" ON public.leads;
DROP POLICY IF EXISTS "View Leads Policy" ON public.leads;
DROP POLICY IF EXISTS "Insert Leads Policy" ON public.leads;
DROP POLICY IF EXISTS "Update Leads Policy" ON public.leads;
DROP POLICY IF EXISTS "Delete Leads Policy" ON public.leads;

CREATE POLICY "View Leads Policy" ON public.leads
  FOR SELECT
  USING (
    organization_id = public.get_my_org_id() AND
    (public.is_admin_or_manager() OR created_by = auth.uid())
  );

CREATE POLICY "Insert Leads Policy" ON public.leads
  FOR INSERT
  WITH CHECK (
    organization_id = public.get_my_org_id() AND
    (public.is_admin_or_manager() OR created_by = auth.uid())
  );

CREATE POLICY "Update Leads Policy" ON public.leads
  FOR UPDATE
  USING (
    organization_id = public.get_my_org_id() AND
    (public.is_admin_or_manager() OR created_by = auth.uid())
  );

CREATE POLICY "Delete Leads Policy" ON public.leads
  FOR DELETE
  USING (
    organization_id = public.get_my_org_id() AND
    (public.is_admin_or_manager() OR created_by = auth.uid())
  );

-- Interactions Policies
DROP POLICY IF EXISTS "Admins and Managers manage all interactions" ON public.interactions;
DROP POLICY IF EXISTS "Vendedores manage own interactions" ON public.interactions;
DROP POLICY IF EXISTS "View Interactions Policy" ON public.interactions;
DROP POLICY IF EXISTS "Manage Interactions Policy" ON public.interactions;

CREATE POLICY "View Interactions Policy" ON public.interactions
  FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Manage Interactions Policy" ON public.interactions
  FOR ALL
  USING (organization_id = public.get_my_org_id());

-- Tasks Policies
DROP POLICY IF EXISTS "Admins and Managers manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Vendedores manage own tasks" ON public.tasks;
DROP POLICY IF EXISTS "View Tasks Policy" ON public.tasks;
DROP POLICY IF EXISTS "Manage Tasks Policy" ON public.tasks;

CREATE POLICY "View Tasks Policy" ON public.tasks
  FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Manage Tasks Policy" ON public.tasks
  FOR ALL
  USING (organization_id = public.get_my_org_id());

-- Proposals Policies
DROP POLICY IF EXISTS "Admins and Managers manage all proposals" ON public.proposals;
DROP POLICY IF EXISTS "Vendedores manage own proposals" ON public.proposals;
DROP POLICY IF EXISTS "View Proposals Policy" ON public.proposals;
DROP POLICY IF EXISTS "Manage Proposals Policy" ON public.proposals;

CREATE POLICY "View Proposals Policy" ON public.proposals
  FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "Manage Proposals Policy" ON public.proposals
  FOR ALL
  USING (organization_id = public.get_my_org_id());


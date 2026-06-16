-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow admins and managers to update their organization
DROP POLICY IF EXISTS "Admins and Managers can update organizations" ON public.organizations;
CREATE POLICY "Admins and Managers can update organizations" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id = get_my_org_id() AND is_admin_or_manager())
  WITH CHECK (id = get_my_org_id() AND is_admin_or_manager());

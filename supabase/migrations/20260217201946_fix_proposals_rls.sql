-- Migration to strictly isolate proposals by organization and remove legacy policies
-- This migration addresses the requirement to fix multi-tenancy leaks in the proposals table.

-- 1. Drop Legacy Permissive Policies (from 20260205210000_add_proposal_details.sql)
-- These policies allowed global view access or user-specific (but not org-specific) write access.
DROP POLICY IF EXISTS "Users can view all proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can insert their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can delete their own proposals" ON public.proposals;

-- 2. Drop previous Multi-tenant Policies to ensure a clean slate (from 20260207120000_add_organizations_and_multitenancy.sql)
-- We remove these to replace them with more granular and strictly named policies below.
DROP POLICY IF EXISTS "View Proposals Policy" ON public.proposals;
DROP POLICY IF EXISTS "Manage Proposals Policy" ON public.proposals;

-- 3. Create Strict Organization Isolation Policies

-- Access Restriction (SELECT): Strictly filter rows where organization_id matches user's org
CREATE POLICY "View Proposals Policy" ON public.proposals
  FOR SELECT
  USING (organization_id = public.get_my_org_id());

-- Access Restriction (INSERT): Ensure assigned organization_id matches user's org
-- The WITH CHECK clause guarantees that new records belong to the user's organization.
CREATE POLICY "Insert Proposals Policy" ON public.proposals
  FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

-- Access Restriction (UPDATE): Only permit updates on rows where organization_id matches
CREATE POLICY "Update Proposals Policy" ON public.proposals
  FOR UPDATE
  USING (organization_id = public.get_my_org_id());

-- Access Restriction (DELETE): Only permit deletions on rows where organization_id matches
CREATE POLICY "Delete Proposals Policy" ON public.proposals
  FOR DELETE
  USING (organization_id = public.get_my_org_id());

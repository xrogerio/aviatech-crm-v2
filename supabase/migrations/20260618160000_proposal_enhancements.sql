-- Add cargo to users and leads
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cargo TEXT;

-- Add company_id and signatory_id to proposals
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS signatory_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proposals_company_id_fkey') THEN
    ALTER TABLE public.proposals ADD CONSTRAINT proposals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proposals_signatory_id_fkey') THEN
    ALTER TABLE public.proposals ADD CONSTRAINT proposals_signatory_id_fkey FOREIGN KEY (signatory_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

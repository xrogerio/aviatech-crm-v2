-- Create a function to automatically set organization_id from the lead if not provided
CREATE OR REPLACE FUNCTION public.set_proposal_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM public.leads
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_proposal_organization_id_trigger ON public.proposals;
CREATE TRIGGER set_proposal_organization_id_trigger
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proposal_organization_id();

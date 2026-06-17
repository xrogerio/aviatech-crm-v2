DO $$
BEGIN
  -- Add created_at and updated_at columns to interactions table
  ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
END $$;

-- Create function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger to ensure it runs on every update
DROP TRIGGER IF EXISTS trigger_update_interactions_updated_at ON public.interactions;
CREATE TRIGGER trigger_update_interactions_updated_at
BEFORE UPDATE ON public.interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_interactions_updated_at();

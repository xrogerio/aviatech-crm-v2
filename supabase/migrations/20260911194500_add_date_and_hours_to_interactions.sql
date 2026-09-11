-- Add interaction_date and hours_used columns to interactions table
ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS interaction_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS hours_used NUMERIC(10, 2);

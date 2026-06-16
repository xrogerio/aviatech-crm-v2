ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS validade TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS itens JSONB DEFAULT '[]'::jsonb;

-- Update RLS policies if necessary (assuming existing policies cover update/insert on these columns for authenticated users)
-- Ensuring authenticated users can interact with proposals table
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all proposals" 
ON public.proposals FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can insert their own proposals" 
ON public.proposals FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own proposals" 
ON public.proposals FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own proposals" 
ON public.proposals FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Novo Projeto';

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'status'
  ) THEN
    UPDATE public.projects p
    SET status = CASE
      WHEN l.status = 'Novo Lead' THEN 'Novo Projeto'
      WHEN l.status = 'Qualificação' THEN 'Qualificação'
      WHEN l.status = 'Proposta Enviada' THEN 'Proposta Enviada'
      WHEN l.status = 'Negociação' THEN 'Negociação'
      WHEN l.status = 'Fechado Ganho' THEN 'Fechado'
      WHEN l.status = 'Fechado Perdido' THEN 'Negado'
      ELSE 'Novo Projeto'
    END
    FROM public.leads l
    WHERE p.lead_id = l.id;
  END IF;
END $$;

ALTER TABLE public.leads DROP COLUMN IF EXISTS status;

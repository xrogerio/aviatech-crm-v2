-- Update existing lead statuses to match the new pipeline stages
UPDATE public.leads SET status = 'Novo Lead' WHERE status = 'Novo';
UPDATE public.leads SET status = 'Qualificação' WHERE status = 'Em Contato';
UPDATE public.leads SET status = 'Proposta Enviada' WHERE status = 'Qualificado';
UPDATE public.leads SET status = 'Negociação' WHERE status = 'Negociacao';
UPDATE public.leads SET status = 'Fechado Ganho' WHERE status = 'Fechado';
UPDATE public.leads SET status = 'Fechado Perdido' WHERE status = 'Perdido';

-- Verify and ensure default is updated if necessary (though text column doesn't enforce enum usually)
ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT 'Novo Lead';

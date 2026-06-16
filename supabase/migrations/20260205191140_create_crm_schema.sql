-- Create users table extending auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'gerente', 'admin'))
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa TEXT NOT NULL,
  contato TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  segmento TEXT,
  tamanho TEXT,
  origem TEXT,
  status TEXT NOT NULL DEFAULT 'Novo',
  created_by UUID REFERENCES public.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create interactions table
CREATE TABLE IF NOT EXISTS public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) DEFAULT auth.uid(),
  tipo TEXT NOT NULL,
  descricao TEXT,
  data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) DEFAULT auth.uid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending'
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  valor NUMERIC,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.users(id) DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Trigger to create public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (NEW.id, 'vendedor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies

-- Users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins and Managers can view all profiles" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );

-- Leads
CREATE POLICY "Admins and Managers manage all leads" ON public.leads
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'gerente'))
  );

CREATE POLICY "Vendedores view own leads" ON public.leads
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Vendedores insert own leads" ON public.leads
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Vendedores update own leads" ON public.leads
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Vendedores delete own leads" ON public.leads
  FOR DELETE USING (created_by = auth.uid());

-- Interactions
CREATE POLICY "Admins and Managers manage all interactions" ON public.interactions
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'gerente'))
  );

CREATE POLICY "Vendedores manage own interactions" ON public.interactions
  USING (user_id = auth.uid());

-- Tasks
CREATE POLICY "Admins and Managers manage all tasks" ON public.tasks
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'gerente'))
  );

CREATE POLICY "Vendedores manage own tasks" ON public.tasks
  USING (user_id = auth.uid());

-- Proposals
CREATE POLICY "Admins and Managers manage all proposals" ON public.proposals
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'gerente'))
  );

CREATE POLICY "Vendedores manage own proposals" ON public.proposals
  USING (created_by = auth.uid());

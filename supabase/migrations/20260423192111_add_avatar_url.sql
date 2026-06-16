-- Add avatar_url to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
DROP POLICY IF EXISTS "Avatar Select" ON storage.objects;
CREATE POLICY "Avatar Select" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Insert" ON storage.objects;
CREATE POLICY "Avatar Insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Update" ON storage.objects;
CREATE POLICY "Avatar Update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Delete" ON storage.objects;
CREATE POLICY "Avatar Delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars');

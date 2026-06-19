-- Create the storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the 'logos' bucket
DO $$
BEGIN
    -- SELECT policy (Public read)
    DROP POLICY IF EXISTS "Logos are publicly accessible" ON storage.objects;
    CREATE POLICY "Logos are publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'logos');

    -- INSERT policy (Authenticated users)
    DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
    CREATE POLICY "Authenticated users can upload logos" ON storage.objects
        FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');

    -- UPDATE policy (Authenticated users)
    DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
    CREATE POLICY "Authenticated users can update logos" ON storage.objects
        FOR UPDATE TO authenticated USING (bucket_id = 'logos');

    -- DELETE policy (Authenticated users)
    DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
    CREATE POLICY "Authenticated users can delete logos" ON storage.objects
        FOR DELETE TO authenticated USING (bucket_id = 'logos');
END $$;

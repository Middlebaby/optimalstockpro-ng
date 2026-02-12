
-- Make inventory-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'inventory-photos';

-- Drop the public select policy
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- Create authenticated-only select policy
CREATE POLICY "Authenticated users can view own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'inventory-photos');

-- 1. Storage: scope photo reads (and uploads) to the owner's folder
DROP POLICY IF EXISTS "Authenticated users can view own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own photos" ON storage.objects;

CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'inventory-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;

CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'inventory-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Harden role-check helpers so direct calls cannot probe other accounts
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (auth.uid() IS NULL OR user_id = auth.uid())
  )
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
      AND (auth.uid() IS NULL OR user_id = auth.uid())
  )
$$;

-- 3. Revoke direct API execution on SECURITY DEFINER routines
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_admin_on_signup() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_admin_on_survey() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Role helpers: signed-in users need EXECUTE because RLS policies call them,
-- but anonymous callers do not.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_manager_or_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin(uuid) TO authenticated, service_role;
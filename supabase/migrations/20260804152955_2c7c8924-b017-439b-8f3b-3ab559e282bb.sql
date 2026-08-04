-- Internal schema that is NOT exposed through the Data API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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
  )
$$;

CREATE OR REPLACE FUNCTION private.is_manager_or_admin(_user_id uuid)
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
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_manager_or_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_manager_or_admin(uuid) TO authenticated, service_role;

-- Repoint existing policies to the internal helpers
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users can update own inventory" ON public.inventory_items;
CREATE POLICY "Users can update own inventory"
ON public.inventory_items FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  AND (is_logged = false OR private.is_manager_or_admin(auth.uid()))
);

DROP POLICY IF EXISTS "Managers can view activity logs" ON public.activity_logs;
CREATE POLICY "Managers can view activity logs"
ON public.activity_logs FOR SELECT TO authenticated
USING (private.is_manager_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL TO authenticated
USING (private.is_manager_or_admin(auth.uid()))
WITH CHECK (private.is_manager_or_admin(auth.uid()));

-- Remove the API-exposed copies
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_manager_or_admin(uuid);
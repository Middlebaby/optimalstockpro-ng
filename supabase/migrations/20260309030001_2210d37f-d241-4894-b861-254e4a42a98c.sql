
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Tips & Guides',
  cover_emoji text DEFAULT '📝',
  author_name text DEFAULT 'Arinola Abolarin',
  read_time text DEFAULT '5 min read',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Admins/managers can manage all posts
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_manager_or_admin(auth.uid()))
  WITH CHECK (public.is_manager_or_admin(auth.uid()));

-- Anyone can read published posts (public blog)
CREATE POLICY "Anyone can read published posts"
  ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

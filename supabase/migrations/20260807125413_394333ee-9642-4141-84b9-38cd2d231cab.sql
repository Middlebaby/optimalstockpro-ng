CREATE TABLE public.job_tokens (
  name text PRIMARY KEY,
  token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.job_tokens TO service_role;

ALTER TABLE public.job_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to job tokens"
ON public.job_tokens
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);
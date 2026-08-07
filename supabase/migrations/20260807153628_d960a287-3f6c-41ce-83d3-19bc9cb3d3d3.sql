CREATE TABLE public.paystack_webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event text NOT NULL,
  reference text,
  email text,
  signature_valid boolean NOT NULL DEFAULT true,
  handled boolean NOT NULL DEFAULT true,
  error text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.paystack_webhook_events TO authenticated;
GRANT ALL ON public.paystack_webhook_events TO service_role;

ALTER TABLE public.paystack_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook events"
ON public.paystack_webhook_events
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_paystack_webhook_events_created_at
ON public.paystack_webhook_events (created_at DESC);
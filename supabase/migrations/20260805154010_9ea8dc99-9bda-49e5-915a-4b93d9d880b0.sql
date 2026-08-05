CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL,
  source_detail TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  business_type TEXT,
  location TEXT,
  employee_count TEXT,
  interest TEXT,
  budget_range TEXT,
  message TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  ai_summary TEXT,
  tags TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  recommended_plan TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  synced_crm_at TIMESTAMP WITH TIME ZONE,
  crm_record_id TEXT,
  crm_provider TEXT,
  raw_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  ndpr_consent BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  url TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
GRANT INSERT ON public.leads TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_activities TO authenticated;
GRANT ALL ON public.lead_activities TO service_role;
GRANT INSERT ON public.lead_activities TO anon;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads can be created by anonymous visitors"
ON public.leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Leads can be created by signed-in users"
ON public.leads FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Leads are viewable by admins and managers"
ON public.leads FOR SELECT TO authenticated USING (private.is_manager_or_admin(auth.uid()));

CREATE POLICY "Leads are editable by admins and managers"
ON public.leads FOR UPDATE TO authenticated USING (private.is_manager_or_admin(auth.uid())) WITH CHECK (private.is_manager_or_admin(auth.uid()));

CREATE POLICY "Leads are deletable by admins"
ON public.leads FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lead activities can be created by anonymous visitors"
ON public.lead_activities FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Lead activities can be created by signed-in users"
ON public.lead_activities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Lead activities are viewable by admins and managers"
ON public.lead_activities FOR SELECT TO authenticated USING (private.is_manager_or_admin(auth.uid()));

CREATE POLICY "Lead activities are deletable by admins"
ON public.lead_activities FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
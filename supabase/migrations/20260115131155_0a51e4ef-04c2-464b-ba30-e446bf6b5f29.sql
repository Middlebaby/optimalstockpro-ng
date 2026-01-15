-- Create table to store survey responses
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  business_type TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  location TEXT NOT NULL,
  current_method TEXT,
  challenges TEXT[],
  challenges_other TEXT,
  biggest_pain TEXT,
  interested_features TEXT[],
  features_other TEXT,
  budget_range TEXT,
  launch_interest TEXT,
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public survey)
CREATE POLICY "Anyone can submit survey" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated admins can view responses (for now, we'll use edge function)
CREATE POLICY "Admins can view survey responses" 
ON public.survey_responses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('admin', 'manager')
));
-- Create a function that calls the notify-admin edge function when a new profile is created
CREATE OR REPLACE FUNCTION public.notify_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
BEGIN
  SELECT net.http_post(
    url := 'https://gelczbmbttziuaawwkxb.supabase.co/functions/v1/notify-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGN6Ym1idHR6aXVhYXd3a3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0OTAzMzUsImV4cCI6MjA4MzA2NjMzNX0.SKxYv9dTuSmAKjHE7EKqGAKpqtg-fQdFQurubNSvJKU'
    ),
    body := jsonb_build_object(
      'type', 'new_signup',
      'record', jsonb_build_object(
        'user_id', NEW.user_id,
        'full_name', NEW.full_name,
        'created_at', NEW.created_at
      )
    )
  ) INTO request_id;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to profiles table (fires after a new profile is inserted = new signup)
DROP TRIGGER IF EXISTS on_new_signup_notify ON public.profiles;
CREATE TRIGGER on_new_signup_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_signup();

-- Create a function that calls notify-admin when a survey response is inserted
CREATE OR REPLACE FUNCTION public.notify_admin_on_survey()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
BEGIN
  SELECT net.http_post(
    url := 'https://gelczbmbttziuaawwkxb.supabase.co/functions/v1/notify-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGN6Ym1idHR6aXVhYXd3a3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0OTAzMzUsImV4cCI6MjA4MzA2NjMzNX0.SKxYv9dTuSmAKjHE7EKqGAKpqtg-fQdFQurubNSvJKU'
    ),
    body := jsonb_build_object(
      'type', 'new_survey',
      'record', to_jsonb(NEW)
    )
  ) INTO request_id;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to survey_responses table
DROP TRIGGER IF EXISTS on_new_survey_notify ON public.survey_responses;
CREATE TRIGGER on_new_survey_notify
  AFTER INSERT ON public.survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_survey();
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_signup() FROM public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_signup() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_survey() FROM public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_survey() FROM authenticated;

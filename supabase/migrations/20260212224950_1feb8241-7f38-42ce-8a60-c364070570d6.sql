
-- Add DELETE policy for profiles (GDPR compliance)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for notification_settings
CREATE POLICY "Users can delete own notification settings"
ON public.notification_settings
FOR DELETE
USING (auth.uid() = user_id);


-- Create a function to delete the current user
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  userid uuid;
BEGIN
  -- Get the ID of the currently authenticated user
  userid := auth.uid();
  
  -- First delete all user data from any tables that reference the user
  DELETE FROM public.user_destinations WHERE user_id = userid;
  DELETE FROM public.profiles WHERE id = userid;
  
  -- Then call Supabase's internal function to delete the user from auth.users
  -- This requires the "delete_user" edge function to be set up
  PERFORM net.http_post(
    url := (SELECT COALESCE(current_setting('app.settings.supabase_url', true), '') || '/functions/v1/delete-user'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT COALESCE(current_setting('request.jwt.claim.session_token', true), ''))
    ),
    body := '{}'
  );
  
  -- Return success
  RETURN;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

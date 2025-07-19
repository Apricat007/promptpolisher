-- Create function to add credits to user account
CREATE OR REPLACE FUNCTION public.add_user_credits(user_email text, credits_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user credits, creating record if it doesn't exist
  INSERT INTO public.credits (user_id, email, current_credits, updated_at)
  VALUES (
    (SELECT id FROM auth.users WHERE email = user_email),
    user_email,
    credits_to_add,
    now()
  )
  ON CONFLICT (email) 
  DO UPDATE SET 
    current_credits = credits.current_credits + credits_to_add,
    updated_at = now();
END;
$$;
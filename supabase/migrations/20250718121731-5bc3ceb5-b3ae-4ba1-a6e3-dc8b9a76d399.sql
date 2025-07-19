-- Create function to refresh daily credits
CREATE OR REPLACE FUNCTION public.refresh_daily_credits()
RETURNS void AS $$
BEGIN
  -- Give 5 daily credits to users who don't have forever access
  UPDATE public.credits 
  SET current_credits = 5,
      updated_at = now()
  WHERE has_forever_access = false;
  
  RAISE LOG 'Daily credits refreshed for % users', 
    (SELECT count(*) FROM public.credits WHERE has_forever_access = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
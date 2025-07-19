-- Schedule daily credit refresh at midnight UTC
SELECT cron.schedule(
  'daily-credit-refresh',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT public.refresh_daily_credits();
  $$
);
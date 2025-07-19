
-- Create a credits table to track user credits
CREATE TABLE public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  current_credits INTEGER NOT NULL DEFAULT 5,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  has_forever_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transactions table to track credit purchases
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  transaction_type TEXT NOT NULL, -- 'credits' or 'forever'
  credits_purchased INTEGER DEFAULT 0,
  amount_paid INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credits
CREATE POLICY "Users can view their own credits" ON public.credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own credits" ON public.credits
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Insert credits" ON public.credits
  FOR INSERT WITH CHECK (true);

-- RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Update transactions" ON public.transactions
  FOR UPDATE USING (true);

-- Function to initialize user credits on signup
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.credits (user_id, email, current_credits)
  VALUES (NEW.id, NEW.email, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize credits when user signs up
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Function to consume a credit
CREATE OR REPLACE FUNCTION public.consume_credit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_credits RECORD;
BEGIN
  -- Get user's credit info
  SELECT * INTO user_credits 
  FROM public.credits 
  WHERE email = user_email;
  
  -- If user has forever access, allow usage
  IF user_credits.has_forever_access THEN
    RETURN TRUE;
  END IF;
  
  -- If user has credits, consume one
  IF user_credits.current_credits > 0 THEN
    UPDATE public.credits 
    SET current_credits = current_credits - 1,
        updated_at = now()
    WHERE email = user_email;
    RETURN TRUE;
  END IF;
  
  -- No credits available
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const userEmail = session.metadata?.user_email;
      const type = session.metadata?.type;

      if (type === 'credits') {
        const credits = parseInt(session.metadata?.credits || '0');
        
        // Add credits to user account
        await supabase.from('credits').update({
          current_credits: supabase.raw(`current_credits + ${credits}`),
          total_purchased: supabase.raw(`total_purchased + ${credits}`),
          updated_at: new Date().toISOString()
        }).eq('email', userEmail);

        // Update transaction status
        await supabase.from('transactions').update({
          status: 'completed'
        }).eq('stripe_session_id', session_id);

        return new Response(JSON.stringify({ 
          success: true, 
          type: 'credits',
          credits: credits 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } else if (type === 'forever') {
        // Grant forever access
        await supabase.from('credits').update({
          has_forever_access: true,
          updated_at: new Date().toISOString()
        }).eq('email', userEmail);

        // Update transaction status
        await supabase.from('transactions').update({
          status: 'completed'
        }).eq('stripe_session_id', session_id);

        return new Response(JSON.stringify({ 
          success: true, 
          type: 'forever' 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

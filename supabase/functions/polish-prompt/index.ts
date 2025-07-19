
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const groqApiKey = Deno.env.get('groq_api');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalPrompt, platform, goal } = await req.json();

    console.log('Polish request received:', { originalPrompt, platform, goal });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user?.email) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Credit system removed - app is now free to use

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Groq API key is not configured properly.',
        details: 'GROQ_API_KEY not found' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert prompt engineer. Your task is to enhance and optimize prompts for different AI platforms and goals. You must respond ONLY with the enhanced prompt - no explanations, no additional text, just the improved prompt itself.`;

    const userPrompt = `Enhance this prompt: "${originalPrompt}" to work better with ${platform} for ${goal} purposes. 

Requirements:
- Make it clear and specific
- Use appropriate formatting for ${platform}
- Optimize for ${goal} outcomes
- Include relevant context and constraints
- Follow best practices for prompt engineering

IMPORTANT: Respond with ONLY the enhanced prompt, no explanations or additional text.`;

    console.log('Making request to Groq API...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const responseText = await response.text();
    console.log('Groq API response status:', response.status);
    console.log('Groq API response:', responseText);

    if (!response.ok) {
      console.error('Groq API error:', response.status, responseText);
      
      let errorMessage = 'Groq API error';
      let userMessage = 'Failed to polish prompt. Please try again.';
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
          
          if (errorMessage.includes('rate_limit')) {
            userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
          } else if (errorMessage.includes('invalid_api_key')) {
            userMessage = 'Invalid Groq API key. Please check your API key configuration.';
          }
        }
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorMessage = `HTTP ${response.status}: ${responseText}`;
      }
      
      return new Response(JSON.stringify({ 
        error: userMessage,
        details: errorMessage 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Groq response:', e);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from Groq API',
        details: 'Failed to parse response' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq response structure:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response structure from Groq API',
        details: 'Missing expected response fields' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const polishedPrompt = data.choices[0].message.content.trim();

    console.log('Successfully generated polished prompt');

    return new Response(JSON.stringify({ polishedPrompt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error in polish-prompt function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred while processing your request.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

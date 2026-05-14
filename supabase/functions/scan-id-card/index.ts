import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { imageBase64, eventId } = await req.json()

    if (!imageBase64) {
      throw new Error('Image data is required')
    }

    // 1. Call OpenAI GPT-4o-mini (Vision)
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "CONFIG_ERROR", 
        message: "OPENAI_API_KEY is missing in Supabase Secrets." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log("Calling OpenAI Vision for event:", eventId);

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Fast, cheap, and supports vision
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "You are an OCR assistant for a corporate event. Look at this ID card image and extract only the PERSON'S NAME. Return ONLY the name, nothing else. If you can't find a name, return 'NONE'." },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 50,
      }),
    });

    const openaiData = await openaiResponse.json();
    
    if (openaiData.error) {
      return new Response(JSON.stringify({ 
        error: "OPENAI_ERROR", 
        message: openaiData.error.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const detectedName = openaiData.choices[0]?.message?.content?.trim() || "";
    console.log("OpenAI Detected Name:", detectedName);

    if (!detectedName || detectedName === "NONE") {
      return new Response(JSON.stringify({
        userFound: false,
        message: "Could not clearly read a name from the card. Please try again."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Find Event
    const { data: event } = await supabaseClient
      .from('events')
      .select('id')
      .eq('event_code', eventId)
      .single();

    if (!event) throw new Error(`Event '${eventId}' not found.`);

    // 3. Smart Matching in Database
    const { data: users } = await supabaseClient
      .from('users')
      .select('*')
      .eq('event_id', event.id)
      .eq('status', 'registered');

    const cleanDetected = detectedName.toLowerCase().trim();
    let matchedUser = null;

    // Sort users by name length (longest first)
    const sortedUsers = (users || []).sort((a, b) => b.name.length - a.name.length);

    for (const user of sortedUsers) {
      const dbName = user.name.toLowerCase().trim();
      
      // Match if the detected name contains the DB name or vice versa
      // Using word boundaries for accuracy
      const escapedDbName = dbName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedDbName}\\b`, 'i');

      if (regex.test(cleanDetected) || cleanDetected.includes(dbName) || dbName.includes(cleanDetected)) {
        matchedUser = user;
        break;
      }
    }

    if (matchedUser) {
      console.log("Matched User:", matchedUser.name);
      return new Response(JSON.stringify({
        userFound: true,
        user: matchedUser,
        detectedText: detectedName
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 4. Fallback (Not in DB)
    return new Response(JSON.stringify({
      userFound: false,
      extractedName: detectedName,
      message: `We read the name '${detectedName}', but couldn't find a matching registration.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: "SERVER_ERROR", message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
})

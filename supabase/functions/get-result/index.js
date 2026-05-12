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

    const { sessionId } = await req.json()

    // 1. Get session and user
    const { data: session, error: sError } = await supabaseClient
      .from('game_sessions')
      .select('*, users(*)')
      .eq('id', sessionId)
      .single()

    if (sError || !session) throw new Error('Session not found')

    // 2. Calculate Rank
    // Rank is count of users with (score > mine) OR (score = mine AND time < mine) + 1
    const { count: higherRankedCount, error: rankError } = await supabaseClient
      .from('game_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', session.event_id)
      .eq('status', 'completed')
      .or(`total_score.gt.${session.total_score},and(total_score.eq.${session.total_score},total_response_time.lt.${session.total_response_time})`)

    if (rankError) throw rankError

    const rank = (higherRankedCount ?? 0) + 1

    // 3. Get Top 10 Leaderboard
    const { data: top10, error: lbError } = await supabaseClient
      .from('leaderboard')
      .select('*')
      .eq('event_id', session.event_id)
      .limit(10)

    if (lbError) throw lbError

    return new Response(JSON.stringify({
      user: session.users,
      result: {
        totalScore: session.total_score,
        totalResponseTime: session.total_response_time,
        rank: rank
      },
      leaderboard: top10
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

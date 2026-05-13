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

    const { eventCode, eventId } = await req.json()

    let targetEventId = eventId

    if (eventCode && !targetEventId) {
      const { data: event } = await supabaseClient
        .from('events')
        .select('id')
        .eq('event_code', eventCode)
        .single()
      if (event) targetEventId = event.id
    }

    if (!targetEventId) throw new Error('Event ID or Code required')

    // 1. Top 10 Leaderboard
    const { data: top10 } = await supabaseClient
      .from('leaderboard')
      .select('*')
      .eq('event_id', targetEventId)
      .limit(10)

    // 2. Stats
    const { count: totalRegistered } = await supabaseClient
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', targetEventId)

    const { count: totalCompleted } = await supabaseClient
      .from('game_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', targetEventId)
      .eq('status', 'completed')

    const { data: statsData } = await supabaseClient
      .from('game_sessions')
      .select('total_score')
      .eq('event_id', targetEventId)
      .eq('status', 'completed')

    const scores = statsData?.map(s => s.total_score) || []
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    // 3. Recently completed
    const { data: recentPlayer } = await supabaseClient
      .from('leaderboard')
      .select('*')
      .eq('event_id', targetEventId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    return new Response(JSON.stringify({
      top10: top10 || [],
      stats: {
        totalRegistered: totalRegistered || 0,
        totalCompleted: totalCompleted || 0,
        highestScore: highestScore,
        averageScore: Math.round(averageScore * 10) / 10
      },
      recentPlayer: recentPlayer || null
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

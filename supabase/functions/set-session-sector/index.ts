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

    const { sessionId, sector } = await req.json()

    if (!sessionId || !sector) {
      throw new Error('Session ID and Sector are required')
    }

    // 1. Get session and event info
    const { data: session, error: sessionError } = await supabaseClient
      .from('game_sessions')
      .select('event_id, user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) throw new Error('Session not found')

    // 2. Fetch questions based on logic: 3 from sector, 2 from Generic
    const sectorUpper = sector.toUpperCase() // Ensure BFSI or MCA
    
    // Fetch sector questions
    const { data: sectorQuestions, error: sError } = await supabaseClient
      .from('questions')
      .select('id')
      .eq('event_id', session.event_id)
      .eq('category', sectorUpper)
      .eq('is_active', true)

    if (sError) throw sError
    if (!sectorQuestions || sectorQuestions.length < 3) {
      throw new Error(`Not enough questions in sector ${sectorUpper}`)
    }

    // Fetch generic questions
    const { data: genericQuestions, error: gError } = await supabaseClient
      .from('questions')
      .select('id')
      .eq('event_id', session.event_id)
      .eq('category', 'Generic')
      .eq('is_active', true)

    if (gError) throw gError
    if (!genericQuestions || genericQuestions.length < 2) {
      throw new Error(`Not enough Generic questions found`)
    }

    // Pick 3 random sector questions
    const selectedSectorIds = sectorQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(q => q.id)

    // Pick 2 random generic questions
    const selectedGenericIds = genericQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map(q => q.id)

    // Combine and shuffle
    const allSelectedIds = [...selectedSectorIds, ...selectedGenericIds]
      .sort(() => 0.5 - Math.random())

    // 3. Update game session
    const { error: updateError } = await supabaseClient
      .from('game_sessions')
      .update({
        selected_questions: allSelectedIds,
        total_questions: allSelectedIds.length,
        current_question_index: 0
      })
      .eq('id', sessionId)

    if (updateError) throw updateError

    // 4. Fetch question details for returning to frontend
    const { data: questions, error: questionsError } = await supabaseClient
      .from('questions')
      .select('id, category, title, scenario')
      .in('id', allSelectedIds)

    if (questionsError) throw questionsError

    // Fetch options
    const { data: allOptions, error: optionsError } = await supabaseClient
      .from('question_options')
      .select('question_id, option_key, option_text')
      .in('question_id', allSelectedIds)

    if (optionsError) throw optionsError

    // Maintain original order
    const questionsWithDetails = allSelectedIds.map(id => {
      const q = questions.find(q => q.id === id)
      return {
        ...q,
        options: allOptions.filter(opt => opt.question_id === id)
      }
    })

    return new Response(JSON.stringify({
      questions: questionsWithDetails
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

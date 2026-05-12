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

    const { eventCode, name, company, designation, email } = await req.json()

    // 1. Find active event
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('id')
      .eq('event_code', eventCode)
      .eq('is_active', true)
      .single()

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: 'Event not found or inactive' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // 2. Create user
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .insert({
        event_id: event.id,
        name,
        company,
        designation,
        email,
        status: 'registered'
      })
      .select()
      .single()

    if (userError) throw userError

    // 3. Fetch questions by category
    const categories = [
      'Cybersecurity',
      'AI Governance',
      'Cloud / Infrastructure',
      'Data Breach / Compliance',
      'Digital Transformation / Leadership'
    ]

    const selectedQuestionIds = []

    for (const category of categories) {
      const { data: questions, error: qError } = await supabaseClient
        .from('questions')
        .select('id')
        .eq('event_id', event.id)
        .eq('category', category)
        .eq('is_active', true)

      if (qError) throw qError
      if (!questions || questions.length === 0) {
        throw new Error(`No questions found for category: ${category}`)
      }

      const randomIdx = Math.floor(Math.random() * questions.length)
      selectedQuestionIds.push(questions[randomIdx].id)
    }

    // 4. Create game session
    const { data: session, error: sessionError } = await supabaseClient
      .from('game_sessions')
      .insert({
        event_id: event.id,
        user_id: user.id,
        selected_questions: selectedQuestionIds,
        current_question_index: 0,
        total_questions: selectedQuestionIds.length,
        status: 'in_progress'
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    return new Response(JSON.stringify({
      userId: user.id,
      sessionId: session.id
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

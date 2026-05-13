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

    // 1. Find session
    const { data: session, error: sessionError } = await supabaseClient
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found')
    }

    if (session.status === 'completed') {
      return new Response(JSON.stringify({ completed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const questionId = session.selected_questions[session.current_question_index]

    // 2. Get question and options
    const { data: question, error: qError } = await supabaseClient
      .from('questions')
      .select('id, category, title, scenario')
      .eq('id', questionId)
      .single()

    if (qError) throw qError

    const { data: options, error: optError } = await supabaseClient
      .from('question_options')
      .select('option_key, option_text')
      .eq('question_id', questionId)

    if (optError) throw optError

    return new Response(JSON.stringify({
      id: question.id,
      category: question.category,
      title: question.title,
      scenario: question.scenario,
      options: options,
      questionNumber: session.current_question_index + 1,
      totalQuestions: session.total_questions,
      timeLimit: 60
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

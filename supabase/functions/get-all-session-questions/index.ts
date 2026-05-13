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

    if (sessionError || !session) throw new Error('Session not found')

    // 2. Fetch all question details
    const { data: questions, error: questionsError } = await supabaseClient
      .from('questions')
      .select('id, category, title, scenario')
      .in('id', session.selected_questions)

    if (questionsError) throw questionsError

    // 3. Fetch options for all questions
    const { data: allOptions, error: optionsError } = await supabaseClient
      .from('question_options')
      .select('question_id, option_key, option_text')
      .in('question_id', session.selected_questions)

    if (optionsError) throw optionsError

    // 4. Map options and maintain original order from session
    const questionsWithDetails = session.selected_questions.map(id => {
      const q = questions.find(q => q.id === id)
      return {
        ...q,
        options: allOptions.filter(opt => opt.question_id === id)
      }
    })

    return new Response(JSON.stringify({
      questions: questionsWithDetails,
      currentIndex: session.current_question_index,
      completed: session.status === 'completed'
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

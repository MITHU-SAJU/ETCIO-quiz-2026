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

    const { sessionId, questionId, selectedOption, responseTime } = await req.json()

    // 1. Find session
    const { data: session, error: sessionError } = await supabaseClient
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) throw new Error('Session not found')
    if (session.status === 'completed') throw new Error('Session already completed')

    // 2. Check for duplicate answer
    const { data: existingAnswer } = await supabaseClient
      .from('answers')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single()

    if (existingAnswer) {
      return new Response(JSON.stringify({ 
        message: 'Answer already submitted',
        nextQuestionAvailable: session.current_question_index + 1 < session.total_questions,
        completed: session.status === 'completed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 3. Validate question matches current index
    const expectedQuestionId = session.selected_questions[session.current_question_index]
    if (expectedQuestionId !== questionId) {
      throw new Error('Question mismatch')
    }

    // 4. Calculate score
    let baseScore = 0
    if (selectedOption) {
      const { data: optionData, error: optError } = await supabaseClient
        .from('question_options')
        .select('score')
        .eq('question_id', questionId)
        .eq('option_key', selectedOption)
        .single()
      
      if (!optError && optionData) {
        baseScore = optionData.score
      }
    }

    // 5. Speed bonus
    let speedBonus = 0
    if (selectedOption && responseTime > 0) {
      if (responseTime <= 10) speedBonus = 20
      else if (responseTime <= 25) speedBonus = 10
    }

    const finalScore = baseScore + speedBonus

    // 6. Save answer
    const { error: answerError } = await supabaseClient
      .from('answers')
      .insert({
        event_id: session.event_id,
        session_id: sessionId,
        user_id: session.user_id,
        question_id: questionId,
        selected_option: selectedOption,
        base_score: baseScore,
        speed_bonus: speedBonus,
        final_score: finalScore,
        response_time: responseTime
      })

    if (answerError) throw answerError

    // 7. Update session
    const nextIndex = session.current_question_index + 1
    const isCompleted = nextIndex >= session.total_questions
    const updatedTotalScore = session.total_score + finalScore
    const updatedTotalTime = Number(session.total_response_time) + Number(responseTime)

    const { error: updateError } = await supabaseClient
      .from('game_sessions')
      .update({
        current_question_index: nextIndex,
        total_score: updatedTotalScore,
        total_response_time: updatedTotalTime,
        status: isCompleted ? 'completed' : 'in_progress',
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', sessionId)

    if (updateError) throw updateError

    // 8. If completed, update user
    if (isCompleted) {
      await supabaseClient
        .from('users')
        .update({
          total_score: updatedTotalScore,
          total_response_time: updatedTotalTime,
          status: 'completed'
        })
        .eq('id', session.user_id)
    }

    // 8. Fetch correct option for feedback
    const { data: correctOption } = await supabaseClient
      .from('question_options')
      .select('option_key')
      .eq('question_id', questionId)
      .eq('score', 100)
      .single()

    return new Response(JSON.stringify({
      nextQuestionAvailable: !isCompleted,
      completed: isCompleted,
      totalScore: updatedTotalScore,
      redirectToResult: isCompleted,
      correctOption: correctOption?.option_key
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

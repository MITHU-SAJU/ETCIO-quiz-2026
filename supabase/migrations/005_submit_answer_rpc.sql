-- RPC: submit_answer
-- Replaces the need for 'submit-answer' Edge Function
-- Handles multi-select (comma separated options) and calculates scores

CREATE OR REPLACE FUNCTION submit_answer(
    p_session_id UUID, 
    p_question_id UUID, 
    p_selected_option TEXT, 
    p_response_time NUMERIC
)
RETURNS JSONB AS $$
DECLARE
    v_session RECORD;
    v_base_score INTEGER := 0;
    v_speed_bonus INTEGER := 0;
    v_final_score INTEGER := 0;
    v_next_index INTEGER;
    v_is_completed BOOLEAN;
    v_correct_option TEXT;
    v_selected_keys TEXT[];
BEGIN
    -- 1. Get session info
    SELECT * INTO v_session FROM game_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found';
    END IF;
    IF v_session.status = 'completed' THEN
        RAISE EXCEPTION 'Session already completed';
    END IF;

    -- 2. Check for duplicate answer
    IF EXISTS (SELECT 1 FROM answers WHERE session_id = p_session_id AND question_id = p_question_id) THEN
        RETURN jsonb_build_object(
            'message', 'Answer already submitted',
            'redirectToResult', v_session.current_question_index + 1 >= v_session.total_questions
        );
    END IF;

    -- 3. Calculate score for selected options
    IF p_selected_option IS NOT NULL AND p_selected_option != '' THEN
        v_selected_keys := string_to_array(p_selected_option, ',');
        
        SELECT COALESCE(SUM(score), 0) INTO v_base_score 
        FROM question_options 
        WHERE question_id = p_question_id 
        AND option_key = ANY(v_selected_keys);
    END IF;

    -- 4. Speed bonus
    IF p_selected_option IS NOT NULL AND p_response_time > 0 THEN
        IF p_response_time <= 10 THEN 
            v_speed_bonus := 20;
        ELSIF p_response_time <= 25 THEN 
            v_speed_bonus := 10;
        END IF;
    END IF;

    v_final_score := v_base_score + v_speed_bonus;

    -- 5. Save answer
    INSERT INTO answers (
        event_id, 
        session_id, 
        user_id, 
        question_id, 
        selected_option, 
        base_score, 
        speed_bonus, 
        final_score, 
        response_time
    ) VALUES (
        v_session.event_id,
        p_session_id,
        v_session.user_id,
        p_question_id,
        p_selected_option,
        v_base_score,
        v_speed_bonus,
        v_final_score,
        p_response_time
    );

    -- 6. Update session
    v_next_index := v_session.current_question_index + 1;
    v_is_completed := v_next_index >= v_session.total_questions;

    UPDATE game_sessions SET
        current_question_index = v_next_index,
        total_score = total_score + v_final_score,
        total_response_time = total_response_time + p_response_time,
        status = CASE WHEN v_is_completed THEN 'completed' ELSE 'in_progress' END,
        completed_at = CASE WHEN v_is_completed THEN NOW() ELSE NULL END
    WHERE id = p_session_id;

    -- 7. Update user if completed
    IF v_is_completed THEN
        UPDATE users SET
            total_score = v_session.total_score + v_final_score,
            total_response_time = v_session.total_response_time + p_response_time,
            status = 'completed'
        WHERE id = v_session.user_id;
    END IF;

    -- 8. Get correct option for feedback
    SELECT option_key INTO v_correct_option 
    FROM question_options 
    WHERE question_id = p_question_id 
    ORDER BY score DESC 
    LIMIT 1;

    RETURN jsonb_build_object(
        'nextQuestionAvailable', NOT v_is_completed,
        'completed', v_is_completed,
        'totalScore', v_session.total_score + v_final_score,
        'redirectToResult', v_is_completed,
        'correctOption', v_correct_option
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

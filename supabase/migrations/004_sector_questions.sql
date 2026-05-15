-- Add Sector-Specific Questions for ETCIO 2026
DO $$
DECLARE
    v_event_id UUID;
    v_q_id UUID;
BEGIN
    -- 1. Get the event ID for ETCIO 2026
    SELECT id INTO v_event_id FROM events WHERE event_code = 'etcio2026';

    -- BFSI Sector Questions
    -- Q1
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'AI Business Impact', 'Where can AI create the fastest business impact in your banking or financial services organization?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Customer onboarding', 100),
    (v_q_id, 'B', 'Fraud detection', 80),
    (v_q_id, 'C', 'Credit and risk', 70),
    (v_q_id, 'D', 'Contact center transformation', 60),
    (v_q_id, 'E', 'Compliance and reporting', 50);

    -- Q2
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'AI Scaling Barriers', 'What is the biggest barrier to scaling AI across your BFSI environment?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Legacy core systems', 100),
    (v_q_id, 'B', 'Data silos', 80),
    (v_q_id, 'C', 'Regulatory concerns', 70),
    (v_q_id, 'D', 'Cybersecurity risk', 60),
    (v_q_id, 'E', 'Unclear business ownership', 50);

    -- Q3
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'AI-led Improvement', 'Which customer journey has the highest potential for AI-led improvement?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Account opening / onboarding', 100),
    (v_q_id, 'B', 'Loan application', 80),
    (v_q_id, 'C', 'Dispute resolution', 70),
    (v_q_id, 'D', 'Claims servicing', 60),
    (v_q_id, 'E', 'Relationship management', 50);

    -- Q4
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'Agentic AI Role', 'Where do you see the strongest role for Agentic AI in BFSI?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Automated service workflows', 100),
    (v_q_id, 'B', 'Intelligent risk monitoring', 80),
    (v_q_id, 'C', 'Proactive fraud investigation', 70),
    (v_q_id, 'D', 'Credit document processing', 60),
    (v_q_id, 'E', 'IT incident resolution', 50);

    -- Q5
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'AI Readiness', 'Which part of your BFSI technology landscape is least ready for AI at scale?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Core banking / policy platforms', 100),
    (v_q_id, 'B', 'Data architecture', 80),
    (v_q_id, 'C', 'Cloud infrastructure', 70),
    (v_q_id, 'D', 'Application estate', 60),
    (v_q_id, 'E', 'Security and governance controls', 50);

    -- Q6
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'AI Trust', 'What would make AI more trusted by leadership, regulators, and business teams?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Explainable decisions', 100),
    (v_q_id, 'B', 'Strong governance', 80),
    (v_q_id, 'C', 'Human oversight', 70),
    (v_q_id, 'D', 'Audit-ready data trails', 60),
    (v_q_id, 'E', 'Clear ROI', 50);

    -- Q7
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'Operational Complexity', 'Where is operational complexity slowing business outcomes the most?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Customer servicing', 100),
    (v_q_id, 'B', 'Risk and compliance', 80),
    (v_q_id, 'C', 'Loan / claims processing', 70),
    (v_q_id, 'D', 'IT operations', 60),
    (v_q_id, 'E', 'Branch and digital channel integration', 50);

    -- Q8
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'Board Priority', 'Which AI-led outcome would matter most to your board in the next 12 months?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Lower cost-to-serve', 100),
    (v_q_id, 'B', 'Faster decision-making', 80),
    (v_q_id, 'C', 'Better fraud prevention', 70),
    (v_q_id, 'D', 'Stronger resilience', 60),
    (v_q_id, 'E', 'Improved customer experience', 50);

    -- Q9
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'Data Friction', 'Where is data creating the most friction for AI adoption?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Customer data fragmentation', 100),
    (v_q_id, 'B', 'Poor data quality', 80),
    (v_q_id, 'C', 'Real-time data access', 70),
    (v_q_id, 'D', 'Consent and privacy management', 60),
    (v_q_id, 'E', 'Data ownership across teams', 50);

    -- Q10
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'BFSI', 'Post-Event Engagement', 'What kind of AI engagement would be most useful after this event?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'BFSI AI use-case discussion', 100),
    (v_q_id, 'B', 'AI readiness assessment', 80),
    (v_q_id, 'C', 'Agentic AI workshop', 70),
    (v_q_id, 'D', 'Secure AI and governance discussion', 60),
    (v_q_id, 'E', 'Modernization roadmap', 50);


    -- MCA Sector Questions
    -- Q1
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'AI Business Impact', 'Where can AI create the fastest business impact in your manufacturing environment?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Predictive maintenance', 100),
    (v_q_id, 'B', 'Quality inspection', 80),
    (v_q_id, 'C', 'Production planning', 70),
    (v_q_id, 'D', 'Supply chain visibility', 60),
    (v_q_id, 'E', 'Energy and cost optimization', 50);

    -- Q2
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'AI Scaling Barriers', 'What is the biggest barrier to scaling AI across plants or business units?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Legacy OT systems', 100),
    (v_q_id, 'B', 'Fragmented plant data', 80),
    (v_q_id, 'C', 'IT / OT integration gaps', 70),
    (v_q_id, 'D', 'Cybersecurity risk', 60),
    (v_q_id, 'E', 'Skills and change management', 50);

    -- Q3
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'Operational Intelligence', 'Which operational area needs better intelligence today?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Asset performance', 100),
    (v_q_id, 'B', 'Inventory planning', 80),
    (v_q_id, 'C', 'Supplier visibility', 70),
    (v_q_id, 'D', 'Plant productivity', 60),
    (v_q_id, 'E', 'Workforce scheduling', 50);

    -- Q4
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'Agentic AI Role', 'Where do you see the strongest role for Agentic AI in MCA?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Automated maintenance workflows', 100),
    (v_q_id, 'B', 'Intelligent supply chain recommendations', 80),
    (v_q_id, 'C', 'Plant performance command center', 70),
    (v_q_id, 'D', 'IT / OT incident response', 60),
    (v_q_id, 'E', 'Quality issue detection and resolution', 50);

    -- Q5
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'AI Readiness', 'Which part of your MCA technology landscape is least ready for AI at scale?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Edge infrastructure', 100),
    (v_q_id, 'B', 'OT systems', 80),
    (v_q_id, 'C', 'Data platforms', 70),
    (v_q_id, 'D', 'Cloud integration', 60),
    (v_q_id, 'E', 'Security architecture', 50);

    -- Q6
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'AI Trust', 'What would make AI more trusted by plant and business leaders?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Proven ROI', 100),
    (v_q_id, 'B', 'Minimal production disruption', 80),
    (v_q_id, 'C', 'Accurate operational data', 70),
    (v_q_id, 'D', 'Human-in-the-loop controls', 60),
    (v_q_id, 'E', 'Clear accountability', 50);

    -- Q7
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'Operational Complexity', 'Where is operational complexity slowing business outcomes the most?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Maintenance', 100),
    (v_q_id, 'B', 'Quality control', 80),
    (v_q_id, 'C', 'Production scheduling', 70),
    (v_q_id, 'D', 'Logistics and distribution', 60),
    (v_q_id, 'E', 'IT / OT operations', 50);

    -- Q8
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'Leadership Priority', 'Which AI-led outcome would matter most to your leadership team in the next 12 months?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Reduced downtime', 100),
    (v_q_id, 'B', 'Improved throughput', 80),
    (v_q_id, 'C', 'Lower operating cost', 70),
    (v_q_id, 'D', 'Better quality', 60),
    (v_q_id, 'E', 'Stronger supply chain resilience', 50);

    -- Q9
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'Data Friction', 'Where is data creating the most friction for AI adoption?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Machine and sensor data quality', 100),
    (v_q_id, 'B', 'Disconnected plant systems', 80),
    (v_q_id, 'C', 'Lack of real-time visibility', 70),
    (v_q_id, 'D', 'Supplier data gaps', 60),
    (v_q_id, 'E', 'Ownership across IT and operations', 50);

    -- Q10
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'MCA', 'Post-Event Engagement', 'What kind of AI engagement would be most useful after this event?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Manufacturing AI use-case discussion', 100),
    (v_q_id, 'B', 'AI readiness assessment', 80),
    (v_q_id, 'C', 'Agentic AI workshop', 70),
    (v_q_id, 'D', 'IT / OT security discussion', 60),
    (v_q_id, 'E', 'Modernization roadmap', 50);


    -- Generic Questions
    -- Q1
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'AI Business Value', 'Where do you see AI creating the fastest business value in your organization?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Customer experience', 100),
    (v_q_id, 'B', 'Operations productivity', 80),
    (v_q_id, 'C', 'Risk and compliance', 70),
    (v_q_id, 'D', 'IT modernization', 60),
    (v_q_id, 'E', 'Supply chain / ecosystem intelligence', 50);

    -- Q2
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'AI Adoption Barriers', 'What is slowing down AI adoption the most today?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Data quality', 100),
    (v_q_id, 'B', 'Legacy systems', 80),
    (v_q_id, 'C', 'Lack of clear use cases', 70),
    (v_q_id, 'D', 'Governance concerns', 60),
    (v_q_id, 'E', 'Skills gap', 50);

    -- Q3
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'AI Readiness', 'Which part of your technology environment is least ready for AI at scale?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Data platforms', 100),
    (v_q_id, 'B', 'Cloud infrastructure', 80),
    (v_q_id, 'C', 'Security architecture', 70),
    (v_q_id, 'D', 'Application estate', 60),
    (v_q_id, 'E', 'Operating model', 50);

    -- Q4
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'Success Metric', 'What outcome would make AI successful for your leadership team in the next 12 months?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Revenue growth', 100),
    (v_q_id, 'B', 'Cost reduction', 80),
    (v_q_id, 'C', 'Faster decisions', 70),
    (v_q_id, 'D', 'Better customer / employee experience', 60),
    (v_q_id, 'E', 'Risk reduction and resilience', 50);

    -- Q5
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'Operational Complexity', 'Where is operational complexity making AI harder to execute?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Fragmented data', 100),
    (v_q_id, 'B', 'Too many legacy applications', 80),
    (v_q_id, 'C', 'Hybrid / multi-cloud complexity', 70),
    (v_q_id, 'D', 'Security and compliance requirements', 60),
    (v_q_id, 'E', 'Lack of process ownership', 50);

    -- Q6
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'Urgent Use Case', 'Which AI use case feels most urgent right now?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Intelligent automation', 100),
    (v_q_id, 'B', 'Predictive insights', 80),
    (v_q_id, 'C', 'GenAI assistants / copilots', 70),
    (v_q_id, 'D', 'Agentic AI workflows', 60),
    (v_q_id, 'E', 'AI for cyber resilience', 50);

    -- Q7
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'AI Governance Maturity', 'How mature is your AI governance today?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Enterprise-wide framework exists', 100),
    (v_q_id, 'B', 'We are building one', 80),
    (v_q_id, 'C', 'Exists in pockets', 70),
    (v_q_id, 'D', 'Still evaluating', 60),
    (v_q_id, 'E', 'Governance is a major concern', 50);

    -- Q8
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'Scaling Concerns', 'What worries you most as AI adoption scales?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Security exposure', 100),
    (v_q_id, 'B', 'Poor data quality', 80),
    (v_q_id, 'C', 'Unclear ROI', 70),
    (v_q_id, 'D', 'Regulatory risk', 60),
    (v_q_id, 'E', 'Loss of control over decisions', 50);

    -- Q9
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'Foundational Work', 'Which foundation needs the most work before AI can scale safely?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Cloud infrastructure', 100),
    (v_q_id, 'B', 'Data architecture', 80),
    (v_q_id, 'C', 'Cybersecurity', 70),
    (v_q_id, 'D', 'Application modernization', 60),
    (v_q_id, 'E', 'Governance model', 50);

    -- Q10
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Generic', 'Post-Event Engagement', 'What kind of AI conversation would be most useful after this event?')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Industry use cases', 100),
    (v_q_id, 'B', 'AI readiness assessment', 80),
    (v_q_id, 'C', 'Agentic AI workshop', 70),
    (v_q_id, 'D', 'Governance and risk discussion', 60),
    (v_q_id, 'E', 'Modernization roadmap', 50);

    -- ... (existing code)
END $$;

-- Postgres Function (RPC) to set session sector and pick questions
-- This replaces the need for a separate Edge Function
CREATE OR REPLACE FUNCTION set_session_sector(p_session_id UUID, p_sector TEXT)
RETURNS JSONB AS $$
DECLARE
    v_event_id UUID;
    v_sector_ids UUID[];
    v_generic_ids UUID[];
    v_all_ids UUID[];
    v_questions JSONB;
BEGIN
    -- 1. Get event info
    SELECT event_id INTO v_event_id FROM game_sessions WHERE id = p_session_id;
    
    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Session not found';
    END IF;

    -- 2. Pick 3 random sector questions
    SELECT ARRAY_AGG(id) INTO v_sector_ids FROM (
        SELECT id FROM questions 
        WHERE event_id = v_event_id 
        AND UPPER(category) = UPPER(p_sector) 
        AND is_active = TRUE 
        ORDER BY RANDOM() 
        LIMIT 3
    ) sub;
    
    IF v_sector_ids IS NULL OR array_length(v_sector_ids, 1) < 3 THEN
        RAISE EXCEPTION 'Not enough questions in sector %', p_sector;
    END IF;

    -- 3. Pick 2 random generic questions
    SELECT ARRAY_AGG(id) INTO v_generic_ids FROM (
        SELECT id FROM questions 
        WHERE event_id = v_event_id 
        AND UPPER(category) = 'GENERIC' 
        AND is_active = TRUE 
        ORDER BY RANDOM() 
        LIMIT 2
    ) sub;

    IF v_generic_ids IS NULL OR array_length(v_generic_ids, 1) < 2 THEN
        RAISE EXCEPTION 'Not enough Generic questions found';
    END IF;
    
    v_all_ids := v_sector_ids || v_generic_ids;
    
    -- Shuffle again
    SELECT ARRAY_AGG(id) INTO v_all_ids FROM (
        SELECT unnest(v_all_ids) as id ORDER BY RANDOM()
    ) sub;

    -- 4. Update session
    UPDATE game_sessions 
    SET selected_questions = v_all_ids,
        total_questions = array_length(v_all_ids, 1),
        current_question_index = 0
    WHERE id = p_session_id;

    -- 5. Fetch details
    SELECT jsonb_agg(q) INTO v_questions FROM (
        SELECT 
            id, category, title, scenario,
            (
                SELECT jsonb_agg(jsonb_build_object('question_id', qo.question_id, 'option_key', qo.option_key, 'option_text', qo.option_text))
                FROM question_options qo 
                WHERE qo.question_id = questions.id
            ) as options
        FROM questions 
        WHERE id = ANY(v_all_ids)
        ORDER BY array_position(v_all_ids, id)
    ) q;

    RETURN jsonb_build_object('questions', v_questions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

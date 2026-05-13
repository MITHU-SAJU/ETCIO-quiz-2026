-- Update Questions for ETCIO 2026
DO $$
DECLARE
    v_event_id UUID;
    v_q_id UUID;
BEGIN
    -- 1. Get the event ID for ETCIO 2026
    SELECT id INTO v_event_id FROM events WHERE event_code = 'etcio2026';

    -- 2. Clear dependent data first to avoid FK violations
    DELETE FROM answers WHERE event_id = v_event_id;
    DELETE FROM game_sessions WHERE event_id = v_event_id;
    DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE event_id = v_event_id);
    DELETE FROM questions WHERE event_id = v_event_id;

    -- 1. Ransomware Attack
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Ransomware Attack', 'A ransomware attack has encrypted 40% of your company’s production servers.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Pay the ransom immediately', 10),
    (v_q_id, 'B', 'Shut down all systems', 40),
    (v_q_id, 'C', 'Activate disaster recovery plan', 100),
    (v_q_id, 'D', 'Inform media first', 10);

    -- 2. Cloud Outage
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cloud / Infrastructure', 'Cloud Outage', 'Your cloud provider experiences a regional outage during peak business hours.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Wait for provider recovery', 10),
    (v_q_id, 'B', 'Shift workloads to backup region', 100),
    (v_q_id, 'C', 'Stop all customer transactions', 10),
    (v_q_id, 'D', 'Reboot infrastructure manually', 40);

    -- 3. AI Governance
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'AI Governance', 'AI Governance', 'An AI model is generating biased customer decisions.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Ignore temporary issues', 10),
    (v_q_id, 'B', 'Disable all AI systems forever', 10),
    (v_q_id, 'C', 'Audit and retrain the model', 100),
    (v_q_id, 'D', 'Hide the issue internally', 10);

    -- 4. Insider Threat
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Insider Threat', 'A senior employee downloaded confidential files before resigning.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Publicly accuse employee', 10),
    (v_q_id, 'B', 'Revoke access and investigate', 100),
    (v_q_id, 'C', 'Delete all logs', 10),
    (v_q_id, 'D', 'Ignore unless leaked', 10);

    -- 5. Data Breach
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Data Breach / Compliance', 'Data Breach', 'Customer financial data may have been exposed.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Delay disclosure', 10),
    (v_q_id, 'B', 'Notify regulators and customers', 100),
    (v_q_id, 'C', 'Shut down website permanently', 10),
    (v_q_id, 'D', 'Delete affected records', 10);

    -- 6. Legacy System Failure
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Digital Transformation / Leadership', 'Legacy System Failure', 'Your 15-year-old ERP system crashes unexpectedly.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Continue manual operations', 40),
    (v_q_id, 'B', 'Accelerate modernization plan', 100),
    (v_q_id, 'C', 'Ignore downtime impact', 10),
    (v_q_id, 'D', 'Replace all hardware instantly', 10);

    -- 7. Multi-Cloud Strategy
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cloud / Infrastructure', 'Multi-Cloud Strategy', 'Your organization depends heavily on one cloud vendor.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Stay fully dependent', 10),
    (v_q_id, 'B', 'Build multi-cloud redundancy', 100),
    (v_q_id, 'C', 'Move back to on-premise only', 40),
    (v_q_id, 'D', 'Reduce cybersecurity budget', 10);

    -- 8. Cybersecurity Budget Cut
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Cybersecurity Budget Cut', 'Finance asks for a 30% cybersecurity budget reduction.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Accept immediately', 10),
    (v_q_id, 'B', 'Cut SOC monitoring', 10),
    (v_q_id, 'C', 'Present business risk analysis', 100),
    (v_q_id, 'D', 'Stop security training', 10);

    -- 9. Supply Chain Cyberattack
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Supply Chain Cyberattack', 'A third-party vendor becomes the source of malware.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Disconnect affected vendor access', 100),
    (v_q_id, 'B', 'Ignore supplier systems', 10),
    (v_q_id, 'C', 'Continue operations normally', 10),
    (v_q_id, 'D', 'Delete vendor contracts instantly', 40);

    -- 10. Zero Trust Implementation
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Zero Trust Implementation', 'Your enterprise begins a Zero Trust security transformation.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Trust all internal users', 10),
    (v_q_id, 'B', 'Verify every access request', 100),
    (v_q_id, 'C', 'Remove MFA systems', 10),
    (v_q_id, 'D', 'Allow unrestricted admin access', 10);

    -- 11. AI Data Leak
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'AI Governance', 'AI Data Leak', 'Employees upload confidential data into public AI tools.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Ignore employee usage', 10),
    (v_q_id, 'B', 'Ban all AI permanently', 10),
    (v_q_id, 'C', 'Introduce AI governance policies', 100),
    (v_q_id, 'D', 'Remove internet access', 10);

    -- 12. Disaster Recovery Test
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Disaster Recovery Test', 'Your disaster recovery drill fails during simulation.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Skip future drills', 10),
    (v_q_id, 'B', 'Improve DR processes immediately', 100),
    (v_q_id, 'C', 'Hide the failure', 10),
    (v_q_id, 'D', 'Delay fixes for next quarter', 40);

    -- 13. Executive Phishing Attack
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Executive Phishing Attack', 'The CFO clicked a phishing email link.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Ignore incident', 10),
    (v_q_id, 'B', 'Reset credentials and isolate systems', 100),
    (v_q_id, 'C', 'Delete email only', 10),
    (v_q_id, 'D', 'Blame finance department', 10);

    -- 14. Smart Infrastructure Failure
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cloud / Infrastructure', 'Smart Infrastructure Failure', 'IoT sensors fail inside a manufacturing plant.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Stop all operations indefinitely', 10),
    (v_q_id, 'B', 'Switch to backup monitoring systems', 100),
    (v_q_id, 'C', 'Ignore faulty sensors', 10),
    (v_q_id, 'D', 'Remove all IoT devices permanently', 10);

    -- 15. ESG Technology Initiative
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Digital Transformation / Leadership', 'ESG Technology Initiative', 'Board members request greener IT operations.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Ignore sustainability goals', 10),
    (v_q_id, 'B', 'Optimize data center energy usage', 100),
    (v_q_id, 'C', 'Increase hardware waste', 10),
    (v_q_id, 'D', 'Disable monitoring tools', 10);

    -- 16. Customer Experience Failure
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Digital Transformation / Leadership', 'Customer Experience Failure', 'Digital banking app crashes during a major campaign.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Shut down marketing', 10),
    (v_q_id, 'B', 'Scale infrastructure dynamically', 100),
    (v_q_id, 'C', 'Ignore complaints', 10),
    (v_q_id, 'D', 'Delay incident response', 40);

    -- 17. Shadow IT Discovery
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Digital Transformation / Leadership', 'Shadow IT Discovery', 'Departments are using unauthorized SaaS tools.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Ignore usage', 10),
    (v_q_id, 'B', 'Implement governance and approved tools', 100),
    (v_q_id, 'C', 'Block all software instantly', 40),
    (v_q_id, 'D', 'Remove employee access entirely', 10);

    -- 18. Quantum Computing Threat
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cybersecurity', 'Quantum Computing Threat', 'Leadership asks about future encryption risks from quantum computing.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Ignore future risks', 10),
    (v_q_id, 'B', 'Begin post-quantum security planning', 100),
    (v_q_id, 'C', 'Disable encryption', 10),
    (v_q_id, 'D', 'Stop cloud adoption', 10);

    -- 19. AI Workforce Automation
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'AI Governance', 'AI Workforce Automation', 'AI automation may reduce operational staffing needs.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Replace staff immediately', 10),
    (v_q_id, 'B', 'Upskill employees for AI collaboration', 100),
    (v_q_id, 'C', 'Stop AI adoption', 10),
    (v_q_id, 'D', 'Hide automation plans', 10);

    -- 20. Global Network Failure
    INSERT INTO questions (event_id, category, title, scenario) 
    VALUES (v_event_id, 'Cloud / Infrastructure', 'Global Network Failure', 'International offices lose connectivity simultaneously.')
    RETURNING id INTO v_q_id;
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    (v_q_id, 'A', 'Wait for ISP updates', 10),
    (v_q_id, 'B', 'Activate network failover systems', 100),
    (v_q_id, 'C', 'Shut all branches', 10),
    (v_q_id, 'D', 'Disable remote access permanently', 10);

END $$;

-- Insert Event
INSERT INTO events (event_code, title, description)
VALUES ('etcio2026', '60-Second CIO Challenge', 'Test your strategic decision-making skills in 60 seconds.')
ON CONFLICT (event_code) DO NOTHING;

-- Get the event id
DO $$
DECLARE
    v_event_id UUID;
BEGIN
    SELECT id INTO v_event_id FROM events WHERE event_code = 'etcio2026';

    -- 1. Cybersecurity Questions
    INSERT INTO questions (event_id, category, title, scenario) VALUES
    (v_event_id, 'Cybersecurity', 'Ransomware Attack', 'Your primary data center is under a massive ransomware attack. The attackers demand $2M in Bitcoin. What is your immediate move?'),
    (v_event_id, 'Cybersecurity', 'Zero-Day Vulnerability', 'A critical zero-day vulnerability is discovered in your core ERP system. No patch is available. How do you handle it?'),
    (v_event_id, 'Cybersecurity', 'Phishing Campaign', 'A high-level executive has fallen for a sophisticated phishing attack, compromising their credentials. What is the priority?'),
    (v_event_id, 'Cybersecurity', 'Insider Threat', 'An employee in the IT department is suspected of exfiltrating sensitive customer data. What is your response?');

    -- 2. AI Governance Questions
    INSERT INTO questions (event_id, category, title, scenario) VALUES
    (v_event_id, 'AI Governance', 'Generative AI Policy', 'Employees are using unsanctioned GenAI tools for internal reports. How do you formalize AI usage?'),
    (v_event_id, 'AI Governance', 'Algorithmic Bias', 'Your automated hiring AI is showing signs of bias against certain demographics. What do you do?'),
    (v_event_id, 'AI Governance', 'Data Privacy in AI', 'Marketing wants to use customer data to train a new AI model. How do you ensure compliance?'),
    (v_event_id, 'AI Governance', 'AI Strategy Alignment', 'The Board demands an "AI-first" strategy, but your infrastructure isn''t ready. How do you proceed?');

    -- 3. Cloud / Infrastructure Questions
    INSERT INTO questions (event_id, category, title, scenario) VALUES
    (v_event_id, 'Cloud / Infrastructure', 'Cloud Cost Management', 'Cloud costs have exceeded the budget by 40% this quarter. What is your optimization strategy?'),
    (v_event_id, 'Cloud / Infrastructure', 'Hybrid Cloud Migration', 'You need to migrate legacy on-prem apps to the cloud while maintaining low latency. What is the approach?'),
    (v_event_id, 'Cloud / Infrastructure', 'Multi-Cloud Strategy', 'A major cloud provider experiences a region-wide outage. How do you ensure business continuity?'),
    (v_event_id, 'Cloud / Infrastructure', 'Edge Computing', 'Your manufacturing plants need real-time data processing for IoT. How do you deploy infrastructure?');

    -- 4. Data Breach / Compliance Questions
    INSERT INTO questions (event_id, category, title, scenario) VALUES
    (v_event_id, 'Data Breach / Compliance', 'GDPR Breach Notification', 'A data breach affecting EU customers is confirmed. You have 72 hours to notify. What is the first step?'),
    (v_event_id, 'Data Breach / Compliance', 'Supply Chain Audit', 'A third-party vendor has failed a security audit. They handle your critical data. How do you react?'),
    (v_event_id, 'Data Breach / Compliance', 'Data Sovereignty', 'New regulations require all citizen data to be stored within national borders. Your data is currently in a global region.'),
    (v_event_id, 'Data Breach / Compliance', 'Legacy Data Retention', 'Legal wants to keep all data indefinitely, but IT is running out of space and compliance risk is high.');

    -- 5. Digital Transformation / Leadership Questions
    INSERT INTO questions (event_id, category, title, scenario) VALUES
    (v_event_id, 'Digital Transformation / Leadership', 'Digital Transformation ROI', 'The CEO is skeptical of the ROI from the latest digital transformation initiative. How do you justify it?'),
    (v_event_id, 'Digital Transformation / Leadership', 'IT-Business Alignment', 'Business units are bypassing IT to buy their own SaaS solutions (Shadow IT). How do you regain control?'),
    (v_event_id, 'Digital Transformation / Leadership', 'Talent Retention', 'Your top cloud architects are being poached by competitors. How do you retain key talent?'),
    (v_event_id, 'Digital Transformation / Leadership', 'Innovation vs. Stability', 'The CTO wants to push updates daily, but Operations demands stability. How do you balance the two?');

    -- Options for Ransomware Attack
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    ((SELECT id FROM questions WHERE title = 'Ransomware Attack'), 'A', 'Isolate affected systems and restore from offline backups.', 100),
    ((SELECT id FROM questions WHERE title = 'Ransomware Attack'), 'B', 'Negotiate with the attackers to lower the ransom.', 40),
    ((SELECT id FROM questions WHERE title = 'Ransomware Attack'), 'C', 'Pay the ransom immediately to minimize downtime.', 10),
    ((SELECT id FROM questions WHERE title = 'Ransomware Attack'), 'D', 'Shut down the entire network and call a press conference.', 70);

    -- Options for Zero-Day Vulnerability
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    ((SELECT id FROM questions WHERE title = 'Zero-Day Vulnerability'), 'A', 'Implement virtual patching and strict WAF rules.', 100),
    ((SELECT id FROM questions WHERE title = 'Zero-Day Vulnerability'), 'B', 'Disconnect the ERP system from the internet.', 70),
    ((SELECT id FROM questions WHERE title = 'Zero-Day Vulnerability'), 'C', 'Wait for the vendor to release an official patch.', 10),
    ((SELECT id FROM questions WHERE title = 'Zero-Day Vulnerability'), 'D', 'Migrate all data to a different ERP system immediately.', 40);

    -- Options for Generative AI Policy
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    ((SELECT id FROM questions WHERE title = 'Generative AI Policy'), 'A', 'Establish a clear AI usage policy and provide enterprise-grade tools.', 100),
    ((SELECT id FROM questions WHERE title = 'Generative AI Policy'), 'B', 'Ban all AI tools on the corporate network.', 40),
    ((SELECT id FROM questions WHERE title = 'Generative AI Policy'), 'C', 'Allow free usage but monitor for data leaks.', 70),
    ((SELECT id FROM questions WHERE title = 'Generative AI Policy'), 'D', 'Ignore it until a security incident occurs.', 10);

    -- Options for Cloud Cost Management
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    ((SELECT id FROM questions WHERE title = 'Cloud Cost Management'), 'A', 'Implement automated scaling and right-sizing of instances.', 100),
    ((SELECT id FROM questions WHERE title = 'Cloud Cost Management'), 'B', 'Move all workloads back to on-premise servers.', 10),
    ((SELECT id FROM questions WHERE title = 'Cloud Cost Management'), 'C', 'Freeze all new cloud deployments indefinitely.', 40),
    ((SELECT id FROM questions WHERE title = 'Cloud Cost Management'), 'D', 'Negotiate better pricing with the cloud provider.', 70);

    -- Options for GDPR Breach Notification
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    ((SELECT id FROM questions WHERE title = 'GDPR Breach Notification'), 'A', 'Invoke the Incident Response Plan and notify regulators.', 100),
    ((SELECT id FROM questions WHERE title = 'GDPR Breach Notification'), 'B', 'Conduct a internal investigation first, notify later.', 40),
    ((SELECT id FROM questions WHERE title = 'GDPR Breach Notification'), 'C', 'Wait for customers to report issues before notifying.', 10),
    ((SELECT id FROM questions WHERE title = 'GDPR Breach Notification'), 'D', 'Hire a PR firm to handle the communication.', 70);

    -- Options for Digital Transformation ROI
    INSERT INTO question_options (question_id, option_key, option_text, score) VALUES
    ((SELECT id FROM questions WHERE title = 'Digital Transformation ROI'), 'A', 'Present metrics tied to business outcomes and efficiency gains.', 100),
    ((SELECT id FROM questions WHERE title = 'Digital Transformation ROI'), 'B', 'Explain the technical superiority of the new stack.', 40),
    ((SELECT id FROM questions WHERE title = 'Digital Transformation ROI'), 'C', 'Argue that transformation is a necessity for survival.', 70),
    ((SELECT id FROM questions WHERE title = 'Digital Transformation ROI'), 'D', 'Ask for more budget to complete the transformation.', 10);

    -- (Repeat for other questions with generic CIO-style answers to fill the gaps)
    -- This is a seed file, so I'll fill the rest with placeholder-like but realistic options
    
    INSERT INTO question_options (question_id, option_key, option_text, score) 
    SELECT q.id, 'A', 'Best strategic approach focusing on long-term stability.', 100 FROM questions q WHERE q.id NOT IN (SELECT question_id FROM question_options);
    
    INSERT INTO question_options (question_id, option_key, option_text, score) 
    SELECT q.id, 'B', 'Good tactical move with some short-term benefits.', 70 FROM questions q WHERE q.id IN (SELECT id FROM questions) AND q.id NOT IN (SELECT question_id FROM question_options WHERE option_key = 'B');

    INSERT INTO question_options (question_id, option_key, option_text, score) 
    SELECT q.id, 'C', 'A risky decision that might lead to further complications.', 40 FROM questions q WHERE q.id IN (SELECT id FROM questions) AND q.id NOT IN (SELECT question_id FROM question_options WHERE option_key = 'C');

    INSERT INTO question_options (question_id, option_key, option_text, score) 
    SELECT q.id, 'D', 'Reactive response with minimal strategic value.', 10 FROM questions q WHERE q.id IN (SELECT id FROM questions) AND q.id NOT IN (SELECT question_id FROM question_options WHERE option_key = 'D');

END $$;

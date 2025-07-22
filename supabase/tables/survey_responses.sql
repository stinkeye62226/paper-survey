CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT gen_random_uuid(),
    question_id INTEGER NOT NULL,
    response_text TEXT,
    response_data JSONB DEFAULT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
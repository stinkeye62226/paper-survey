CREATE TABLE survey_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    total_questions INTEGER DEFAULT 0,
    completed_questions INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false
);
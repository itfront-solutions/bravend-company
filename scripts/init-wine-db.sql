-- Create enums first
DO $$ BEGIN
    CREATE TYPE wine_game_mode AS ENUM ('individual', 'leader');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wine_status AS ENUM ('pending', 'active', 'finished');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wine_option AS ENUM ('a', 'b', 'c', 'd');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wine_question_type AS ENUM ('multiple_choice', 'dropdown', 'autocomplete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS wine_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL,
    qr_code TEXT,
    max_members INTEGER DEFAULT 4,
    icon VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS wine_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_id INTEGER REFERENCES wine_teams(id),
    is_leader BOOLEAN DEFAULT false,
    session_token VARCHAR(255) UNIQUE,
    device_fingerprint VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wine_game_sessions (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    game_mode wine_game_mode NOT NULL,
    status wine_status DEFAULT 'pending',
    current_question_id INTEGER,
    current_round_id INTEGER
);

CREATE TABLE IF NOT EXISTS wine_rounds (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES wine_game_sessions(id),
    round_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    wine_type VARCHAR(255),
    description TEXT,
    status wine_status DEFAULT 'pending',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    question_ids INTEGER[]
);

CREATE TABLE IF NOT EXISTS wine_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type wine_question_type DEFAULT 'multiple_choice',
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_option wine_option,
    options TEXT[],
    correct_answer TEXT,
    weight REAL NOT NULL,
    round_id INTEGER REFERENCES wine_rounds(id)
);

CREATE TABLE IF NOT EXISTS wine_answers (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES wine_game_sessions(id),
    question_id INTEGER REFERENCES wine_questions(id),
    user_id INTEGER REFERENCES wine_users(id),
    round_id INTEGER REFERENCES wine_rounds(id),
    selected_option wine_option,
    text_answer TEXT,
    is_correct BOOLEAN,
    points_awarded REAL,
    answered_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wine_admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS wine_round_results (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES wine_game_sessions(id),
    round_id INTEGER NOT NULL REFERENCES wine_rounds(id),
    team_id INTEGER NOT NULL REFERENCES wine_teams(id),
    team_name VARCHAR(255) NOT NULL,
    total_score REAL NOT NULL,
    round_score REAL NOT NULL,
    position INTEGER NOT NULL,
    finished_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wine_team_registrations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES wine_teams(id),
    session_id INTEGER NOT NULL REFERENCES wine_game_sessions(id),
    custom_team_name VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wine_user_session_state (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES wine_users(id),
    session_id INTEGER NOT NULL REFERENCES wine_game_sessions(id),
    round_id INTEGER REFERENCES wine_rounds(id),
    current_question_id INTEGER REFERENCES wine_questions(id),
    question_start_time TIMESTAMP,
    time_remaining INTEGER,
    selected_option wine_option,
    text_answer_draft TEXT,
    has_answered_current BOOLEAN DEFAULT false,
    is_round_completed BOOLEAN DEFAULT false,
    is_quiz_completed BOOLEAN DEFAULT false,
    last_activity TIMESTAMP DEFAULT NOW(),
    last_synced_at TIMESTAMP DEFAULT NOW(),
    device_fingerprint VARCHAR(255),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO wine_teams (name, color, qr_code, max_members, icon) VALUES
('Mesa 1', '#8B5CF6', 'wine-quiz-team-1', 4, '🍷'),
('Mesa 2', '#06B6D4', 'wine-quiz-team-2', 4, '🌿'),
('Mesa 3', '#10B981', 'wine-quiz-team-3', 4, '🍇'),
('Mesa 4', '#F59E0B', 'wine-quiz-team-4', 4, '🥂'),
('Mesa 5', '#EF4444', 'wine-quiz-team-5', 4, '🍾')
ON CONFLICT (id) DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO wine_admins (email, password) VALUES
('admin@winequiz.com', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8V2F7z9WfSgJP1bEapL7yVzn6qiT..')
ON CONFLICT (email) DO NOTHING;

-- Insert sample questions
INSERT INTO wine_questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, weight, round_id) VALUES
('Qual país é considerado o berço do vinho?', 'multiple_choice', 'França', 'Itália', 'Geórgia', 'Grécia', 'c', 1, null),
('Qual é a variedade de uva mais plantada no mundo?', 'multiple_choice', 'Cabernet Sauvignon', 'Merlot', 'Kyoho', 'Chardonnay', 'c', 1, null),
('Em que temperatura ideal deve ser servido um vinho tinto encorpado?', 'multiple_choice', '8-10°C', '12-14°C', '16-18°C', '20-22°C', 'c', 1, null),
('O que significa terroir na enologia?', 'multiple_choice', 'Tipo de solo onde cresce a vinha', 'Técnica de vinificação', 'Conjunto de fatores naturais de uma região', 'Período de envelhecimento do vinho', 'c', 1, null),
('Qual processo é responsável pela transformação do mosto em vinho?', 'multiple_choice', 'Maceração', 'Fermentação', 'Clarificação', 'Estabilização', 'b', 1, null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO wine_questions (question_text, question_type, options, correct_answer, weight, round_id) VALUES
('Qual região da França é famosa pelos vinhos Champagne?', 'autocomplete', ARRAY['Champagne', 'Borgonha', 'Bordeaux', 'Vale do Loire', 'Alsácia', 'Rhône', 'Languedoc'], 'Champagne', 1, null),
('Complete: O Vinho do Porto é um vinho _______ português.', 'autocomplete', ARRAY['fortificado', 'espumante', 'seco', 'doce', 'licoroso', 'generoso'], 'fortificado', 1, null),
('Qual uva é tradicionalmente usada para fazer Chianti?', 'autocomplete', ARRAY['Sangiovese', 'Nebbiolo', 'Barbera', 'Montepulciano', 'Aglianico'], 'Sangiovese', 1, null)
ON CONFLICT (id) DO NOTHING;
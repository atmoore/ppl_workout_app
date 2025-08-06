-- Ultimate PPL System Workout Tracker Database Schema

-- Users table (for future multi-user support)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Program templates (stores the base workout structure)
CREATE TABLE program_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL, -- "Ultimate PPL System"
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Week templates (Week 1, Week 2, etc.)
CREATE TABLE week_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER REFERENCES program_templates(id),
    week_number INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL, -- "Week 1"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout templates (Push, Pull, Upper, Lower, Legs)
CREATE TABLE workout_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_id INTEGER REFERENCES week_templates(id),
    name VARCHAR(50) NOT NULL, -- "Push #1 - Week 1"
    workout_type VARCHAR(20) NOT NULL, -- "push", "pull", "upper", "lower", "legs"
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise templates (the base exercises with their parameters)
CREATE TABLE exercise_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER REFERENCES workout_templates(id),
    name VARCHAR(100) NOT NULL,
    order_index INTEGER NOT NULL,
    warmup_sets VARCHAR(10), -- "3-4", "0", "2-3"
    working_sets INTEGER NOT NULL,
    target_reps VARCHAR(20), -- "3-5", "10", "8-10", "AMRAP"
    target_rpe VARCHAR(10), -- "8-9", "9-10", "N/A"
    rest_time VARCHAR(20), -- "~3-4 min", "0 min"
    substitution_1 VARCHAR(100),
    substitution_2 VARCHAR(100),
    coaching_notes TEXT,
    youtube_link VARCHAR(200),
    is_superset BOOLEAN DEFAULT FALSE,
    superset_group VARCHAR(10), -- "A1", "A2", etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User workout sessions (actual logged workouts)
CREATE TABLE workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    workout_template_id INTEGER REFERENCES workout_templates(id),
    session_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
    session_notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logged exercise sets (actual performance data)
CREATE TABLE exercise_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES workout_sessions(id),
    exercise_template_id INTEGER REFERENCES exercise_templates(id),
    set_number INTEGER NOT NULL,
    set_type VARCHAR(20) DEFAULT 'working', -- 'warmup', 'working', 'dropset', 'failure'
    weight_used DECIMAL(6,2), -- pounds or kg
    reps_completed INTEGER,
    rpe_achieved DECIMAL(3,1), -- 7.5, 8.0, etc.
    rest_time_seconds INTEGER,
    substitution_used VARCHAR(100), -- if they used a substitution
    set_notes TEXT,
    completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings and preferences
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    weight_unit VARCHAR(5) DEFAULT 'lbs', -- 'lbs' or 'kg'
    default_rest_timer INTEGER DEFAULT 120, -- seconds
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress tracking metrics
CREATE TABLE progress_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    exercise_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(20) NOT NULL, -- 'max_weight', 'volume', 'reps'
    metric_value DECIMAL(8,2),
    recorded_date DATE NOT NULL,
    session_id INTEGER REFERENCES workout_sessions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, session_date);
CREATE INDEX idx_exercise_logs_session ON exercise_logs(session_id);
CREATE INDEX idx_exercise_logs_exercise ON exercise_logs(exercise_template_id);
CREATE INDEX idx_progress_metrics_user_exercise ON progress_metrics(user_id, exercise_name);

-- Sample data insertion for Week 1 (this would be populated from your JSON)
INSERT INTO program_templates (name, version) VALUES ('Ultimate PPL System', '1.0');
INSERT INTO week_templates (program_id, week_number, name) VALUES (1, 1, 'Week 1');

-- Insert workout templates
INSERT INTO workout_templates (week_id, name, workout_type, order_index) VALUES 
(1, 'Push #1 - Week 1', 'push', 1),
(1, 'Pull #1 - Week 1', 'pull', 2),
(1, 'Upper #1 - Week 1', 'upper', 3),
(1, 'Lower #1 - Week 1', 'lower', 4),
(1, 'Legs #2 - Week 1', 'legs', 5);
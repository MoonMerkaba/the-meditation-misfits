-- Guided Meditations Library Schema

-- Categories table
CREATE TABLE IF NOT EXISTS meditation_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guided meditations table
CREATE TABLE IF NOT EXISTS guided_meditations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES meditation_categories(id),
  duration INTEGER NOT NULL, -- in minutes
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  voice_type TEXT,
  audio_url TEXT,
  background_music_url TEXT,
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User meditation progress
CREATE TABLE IF NOT EXISTS meditation_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  meditation_id UUID REFERENCES guided_meditations(id) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, meditation_id)
);

-- Enable RLS
ALTER TABLE meditation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE guided_meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Categories are viewable by everyone" ON meditation_categories FOR SELECT USING (true);
CREATE POLICY "Meditations are viewable by everyone" ON guided_meditations FOR SELECT USING (true);
CREATE POLICY "Premium users can upload meditations" ON guided_meditations FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can view own progress" ON meditation_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON meditation_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON meditation_progress FOR UPDATE USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO meditation_categories (name, description, icon) VALUES
  ('Stress Relief', 'Calm your mind and release tension', '🧘'),
  ('Sleep', 'Drift into peaceful slumber', '😴'),
  ('Focus', 'Enhance concentration and clarity', '🎯'),
  ('Anxiety', 'Find peace and reduce worry', '💆'),
  ('Gratitude', 'Cultivate appreciation and joy', '🙏'),
  ('Manifestation', 'Align with your desires', '✨');

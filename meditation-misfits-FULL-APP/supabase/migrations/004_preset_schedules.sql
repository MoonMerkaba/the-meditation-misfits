-- Create preset_schedules table
CREATE TABLE IF NOT EXISTS preset_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_id UUID NOT NULL REFERENCES soundicine_presets(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  time_of_day TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- 0=Sunday, 1=Monday, etc.
  is_active BOOLEAN DEFAULT true,
  notification_minutes_before INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_preset_schedules_user ON preset_schedules(user_id);
CREATE INDEX idx_preset_schedules_active ON preset_schedules(is_active);

-- Enable RLS
ALTER TABLE preset_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own schedules"
  ON preset_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own schedules"
  ON preset_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON preset_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON preset_schedules FOR DELETE
  USING (auth.uid() = user_id);

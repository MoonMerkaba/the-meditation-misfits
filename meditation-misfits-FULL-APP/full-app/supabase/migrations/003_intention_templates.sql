-- Create intention templates table
CREATE TABLE IF NOT EXISTS intention_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  north_star TEXT NOT NULL,
  area TEXT NOT NULL,
  image_url TEXT,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  example_wins JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert pre-made templates
INSERT INTO intention_templates (category, title, description, north_star, area, image_url, suggested_actions, example_wins) VALUES
('financial', 'Financial Freedom', 'Build wealth and achieve financial independence', 'I am financially abundant and free to live life on my terms', 'Wealth & Abundance', 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1762664506628_2a99560c.webp', 
  '["Create and stick to a monthly budget", "Increase income streams", "Invest 20% of income", "Pay off high-interest debt", "Build 6-month emergency fund"]'::jsonb,
  '["Received unexpected money", "Got a raise or promotion", "Paid off a credit card", "Made first investment", "Saved $1000 milestone"]'::jsonb),

('love', 'Finding True Love', 'Attract and nurture a loving, authentic relationship', 'I am worthy of deep, unconditional love and attract my ideal partner', 'Love & Relationships', 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1762664507396_9a4fadc6.webp',
  '["Practice self-love daily", "Be open to new connections", "Heal past relationship wounds", "Clarify relationship values", "Put yourself in social situations"]'::jsonb,
  '["Had meaningful conversation with someone new", "Felt genuinely happy alone", "Set healthy boundary", "Went on inspiring date", "Received compliment"]'::jsonb),

('career', 'Career Breakthrough', 'Achieve professional success and fulfillment', 'I am thriving in my dream career and making meaningful impact', 'Career & Purpose', 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1762664508119_7e749ca2.webp',
  '["Update resume and LinkedIn", "Network with industry leaders", "Develop key skill", "Apply to dream positions", "Seek mentorship"]'::jsonb,
  '["Got interview invitation", "Made valuable connection", "Completed certification", "Received positive feedback", "Led successful project"]'::jsonb),

('health', 'Health Transformation', 'Transform your physical and mental wellbeing', 'I am vibrant, healthy, and energized in body and mind', 'Health & Vitality', 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1762664508854_9f86a53c.webp',
  '["Exercise 4x per week", "Eat whole, nutritious foods", "Get 8 hours of sleep", "Drink 8 glasses of water daily", "Practice stress management"]'::jsonb,
  '["Hit fitness milestone", "Felt energized all day", "Received health compliment", "Improved lab results", "Completed workout streak"]'::jsonb),

('creativity', 'Creative Breakthrough', 'Unlock your creative potential and express your gifts', 'I am a channel for creative inspiration and my art flows effortlessly', 'Creativity & Expression', 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1762664509597_70ae0277.webp',
  '["Create daily for 30 minutes", "Share work publicly", "Learn new technique", "Collaborate with other creatives", "Enter competition or show"]'::jsonb,
  '["Completed creative project", "Received positive feedback", "Felt flow state", "Made sale or got commission", "Inspired someone else"]'::jsonb),

('spiritual', 'Inner Peace & Growth', 'Deepen spiritual connection and find lasting peace', 'I am connected to infinite wisdom and live in peaceful alignment', 'Spiritual Growth', 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1762664510332_6f9c8a2e.webp',
  '["Meditate daily", "Journal thoughts and insights", "Practice gratitude", "Study spiritual teachings", "Spend time in nature"]'::jsonb,
  '["Experienced moment of clarity", "Felt deep peace", "Had synchronistic event", "Helped someone selflessly", "Released old pattern"]'::jsonb);

-- Enable RLS
ALTER TABLE intention_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for templates
CREATE POLICY "Templates are viewable by everyone"
  ON intention_templates FOR SELECT
  USING (true);

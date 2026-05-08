-- Create table to store Constant Contact OAuth tokens
CREATE TABLE IF NOT EXISTS constant_contact_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE constant_contact_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role access
CREATE POLICY "Service role can manage tokens" ON constant_contact_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

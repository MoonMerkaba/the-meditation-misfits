-- Security Audit Log Migration
-- This migration creates the security audit log table and related configurations

-- Create security_audit_log table for tracking security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_id UUID REFERENCES auth.users(id),
  function_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity ON public.security_audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_ip_address ON public.security_audit_log(ip_address);

-- Enable RLS
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service_role can access this table (for edge functions and admin queries)
REVOKE ALL ON public.security_audit_log FROM anon, authenticated;

-- Force RLS for table owner
ALTER TABLE public.security_audit_log FORCE ROW LEVEL SECURITY;

-- Create policy for service_role to have full access
CREATE POLICY "service_role_full_access" ON public.security_audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create table to track alert thresholds and cooldowns
CREATE TABLE IF NOT EXISTS public.security_alert_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT UNIQUE NOT NULL,
  threshold INTEGER DEFAULT 5,
  time_window_minutes INTEGER DEFAULT 15,
  cooldown_minutes INTEGER DEFAULT 60,
  last_alert_sent TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default alert configurations
INSERT INTO public.security_alert_config (alert_type, threshold, time_window_minutes, cooldown_minutes) VALUES
  ('token_refresh_failure', 3, 15, 60),
  ('invalid_request', 10, 5, 30),
  ('unauthorized_access', 5, 10, 60),
  ('rate_limit_exceeded', 20, 5, 15),
  ('suspicious_activity', 3, 30, 120)
ON CONFLICT (alert_type) DO NOTHING;

-- Enable RLS on config table
ALTER TABLE public.security_alert_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_alert_config FROM anon, authenticated;
ALTER TABLE public.security_alert_config FORCE ROW LEVEL SECURITY;

CREATE POLICY "service_role_config_access" ON public.security_alert_config
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.security_audit_log IS 'Stores security events for monitoring and compliance';
COMMENT ON TABLE public.security_alert_config IS 'Configuration for security alert thresholds and cooldowns';

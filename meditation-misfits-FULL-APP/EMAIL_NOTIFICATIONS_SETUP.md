# Email Notifications Setup Guide

## Overview
The Meditation Misfits app includes a comprehensive email notification system with three types of automated emails:

1. **Daily Reminders** - Sent hourly to users based on their preferred time
2. **Weekly Summaries** - Sent weekly with progress stats
3. **Milestone Alerts** - Sent when users achieve specific milestones

## Deployed Edge Functions

### 1. send-daily-reminder
- **Function ID**: `52febd13-f5f6-47ee-8fd2-eb8c1d9542a6`
- **Endpoint**: `https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-daily-reminder`
- **Purpose**: Sends meditation reminders to users at their preferred time
- **Runs**: Hourly (via cron job)

### 2. send-weekly-summary
- **Function ID**: `f7f9c4b0-e25f-4a4a-8df3-d21307f5fd79`
- **Endpoint**: `https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-weekly-summary`
- **Purpose**: Sends weekly progress summaries with streak and session stats
- **Runs**: Weekly on Sundays at 9 AM UTC (via cron job)

### 3. milestone-alert (pending deployment)
- **Purpose**: Sends celebration emails when users achieve milestones
- **Triggered**: Called directly from the app when milestones are reached

## Setting Up Cron Jobs

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create a new cron job for daily reminders:
   ```sql
   SELECT cron.schedule(
     'send-daily-reminders',
     '0 * * * *',  -- Every hour
     $$
     SELECT net.http_post(
       url:='https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-daily-reminder',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
       body:='{}'::jsonb
     );
     $$
   );
   ```

3. Create a cron job for weekly summaries:
   ```sql
   SELECT cron.schedule(
     'send-weekly-summaries',
     '0 9 * * 0',  -- Every Sunday at 9 AM UTC
     $$
     SELECT net.http_post(
       url:='https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-weekly-summary',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
       body:='{}'::jsonb
     );
     $$
   );
   ```

### Option 2: External Cron Service
Use services like cron-job.org, EasyCron, or GitHub Actions:

**Daily Reminder (Hourly)**:
- URL: `https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-daily-reminder`
- Method: POST
- Schedule: Every hour (0 * * * *)

**Weekly Summary**:
- URL: `https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-weekly-summary`
- Method: POST
- Schedule: Weekly on Sunday at 9 AM UTC (0 9 * * 0)

## User Preferences

Users can customize their email preferences in their profile settings:
- Enable/disable daily reminders
- Set preferred reminder time
- Enable/disable weekly summaries
- Enable/disable milestone alerts
- Enable/disable frequency drop notifications
- Enable/disable community updates

## Environment Variables

All functions use the following environment variable:
- `SENDGRID_API_KEY` - Already configured in Supabase

## Testing

Test the functions manually:

```bash
# Test daily reminder
curl -X POST https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-daily-reminder \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test weekly summary
curl -X POST https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/send-weekly-summary \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Milestone Triggers

Milestones are automatically triggered from the app when:
- First meditation session completed
- 7-day streak achieved
- 30-day streak achieved
- 10, 50, or 100 sessions completed
- First manifestation win logged
- 10 manifestation wins logged

## Monitoring

Monitor email delivery in:
1. Supabase Dashboard → Edge Functions → Logs
2. SendGrid Dashboard → Activity Feed
3. Check `email_preferences` table for user settings

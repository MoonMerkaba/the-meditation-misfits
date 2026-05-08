# Slack Webhook Integration for Security Alerts

This guide explains how to set up Slack incoming webhooks to receive security alerts from the Freqyn platform.

## Prerequisites

- A Slack workspace where you have permission to add apps
- Admin access to the Freqyn Security Dashboard

## Step 1: Create a Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Select **"From scratch"**
4. Enter:
   - **App Name**: `Freqyn Security Alerts`
   - **Workspace**: Select your workspace
5. Click **"Create App"**

## Step 2: Enable Incoming Webhooks

1. In your app settings, click **"Incoming Webhooks"** in the left sidebar
2. Toggle **"Activate Incoming Webhooks"** to **On**
3. Click **"Add New Webhook to Workspace"**
4. Select the channel `#security-alerts` (create it first if needed)
5. Click **"Allow"**
6. Copy the **Webhook URL** that appears (starts with `https://hooks.slack.com/services/...`)

## Step 3: Create the #security-alerts Channel

If you haven't already:

1. In Slack, click the **+** next to "Channels"
2. Select **"Create a channel"**
3. Name it `security-alerts`
4. Set it to **Private** (recommended for security alerts)
5. Add relevant team members
6. Click **"Create"**

## Step 4: Add the Webhook URL to Supabase

The `SLACK_WEBHOOK_URL` secret has already been configured in your Supabase project.

If you need to update it:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions**
4. Click **"Manage Secrets"**
5. Find `SLACK_WEBHOOK_URL` and update the value
6. Paste your webhook URL

## Step 5: Test the Integration

### Option A: From the Security Dashboard

1. Navigate to `/security` in your Freqyn app
2. Click the **"Test Slack"** button in the header
3. Check your `#security-alerts` channel for a test message

### Option B: Trigger a Manual Alert Check

1. Navigate to `/security` in your Freqyn app
2. Click the **"Check Alerts"** button
3. This will check for any security events that exceed thresholds
4. If alerts are found, they'll be sent to Slack

### Option C: Insert a Test Security Event

```sql
INSERT INTO security_audit_log (
  event_type,
  severity,
  message,
  metadata,
  function_name
) VALUES (
  'test_alert',
  'critical',
  'Test critical security event for Slack webhook verification',
  '{"test": true, "source": "manual_test"}',
  'manual-test'
);
```

Then click "Check Alerts" in the Security Dashboard.

## Alert Types and Thresholds

The following alert types are configured by default:

| Alert Type | Threshold | Time Window | Cooldown |
|------------|-----------|-------------|----------|
| `failed_login` | 5 events | 15 minutes | 60 minutes |
| `rate_limit_exceeded` | 10 events | 5 minutes | 30 minutes |
| `suspicious_activity` | 3 events | 10 minutes | 60 minutes |
| `unauthorized_access` | 1 event | 5 minutes | 15 minutes |
| `api_abuse` | 20 events | 15 minutes | 60 minutes |
| `data_export` | 5 events | 30 minutes | 120 minutes |
| `password_reset` | 10 events | 60 minutes | 120 minutes |
| `account_lockout` | 3 events | 15 minutes | 60 minutes |

You can modify these thresholds in the **Alert Configuration** tab of the Security Dashboard.

## Slack Message Format

Security alerts are sent as rich Slack messages with:

- **Header**: "Security Alert - Freqyn"
- **Time**: UTC timestamp of the alert
- **Critical Events**: Count and details of critical severity events
- **Threshold Alerts**: List of alert types that exceeded thresholds
- **Suspicious IPs**: IPs with unusually high activity

Example alert:

```
🚨 Security Alert - Freqyn

*Time:* 2025-12-07T06:00:00.000Z

*Critical Events:* 2
- Unauthorized access attempt from IP 192.168.1.100
- Multiple failed login attempts detected

*Threshold Alerts:*
- failed_login: 8 events
- rate_limit_exceeded: 15 events

*Suspicious IPs:*
- 192.168.1.100: 25 events
- 10.0.0.50: 12 events
```

## Troubleshooting

### Alerts not appearing in Slack

1. **Check the webhook URL**: Ensure it's correctly configured in Supabase secrets
2. **Check channel permissions**: Make sure the app is added to the channel
3. **Check function logs**: View edge function logs for errors
4. **Verify alert thresholds**: Events may not exceed configured thresholds

### Test button shows "Slack webhook not configured"

1. Verify the `SLACK_WEBHOOK_URL` secret exists in Supabase
2. Redeploy the edge function after adding the secret
3. Check that the secret name is exactly `SLACK_WEBHOOK_URL`

### Rate limiting

Slack has rate limits for incoming webhooks:
- 1 message per second per webhook
- The edge function includes cooldown periods to prevent spam

## Additional Integrations

### PagerDuty Integration

For critical alerts, you can also integrate with PagerDuty by adding a `PAGERDUTY_ROUTING_KEY` secret and updating the edge function.

### Discord Integration

Discord webhooks work similarly to Slack. Create a webhook in your Discord server and add the URL as `DISCORD_WEBHOOK_URL`.

## Security Considerations

- Keep your webhook URL secret - anyone with the URL can post to your channel
- Use private channels for security alerts
- Regularly rotate webhook URLs if compromised
- Monitor for webhook abuse in Slack's app management

## Support

For issues with the Slack integration:
1. Check the [Slack API documentation](https://api.slack.com/messaging/webhooks)
2. Review edge function logs in Supabase
3. Contact support at support@freqyn.com

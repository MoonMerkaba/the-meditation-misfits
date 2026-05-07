# Security Monitoring System Setup Guide

This guide covers the complete setup for Freqyn's security monitoring system, including email alerts, Slack notifications, webhooks, rate limiting, and geographic IP blocking.

## Table of Contents

1. [Email Notifications (SendGrid)](#email-notifications-sendgrid)
2. [Slack Webhook Integration](#slack-webhook-integration)
3. [Custom Webhooks](#custom-webhooks)
4. [Automated Scheduled Checks (pg_cron)](#automated-scheduled-checks)
5. [Rate Limiting Middleware](#rate-limiting-middleware)
6. [IP Blocking System](#ip-blocking-system)
7. [Geographic Blocking](#geographic-blocking)
8. [API Reference](#api-reference)

---

## Email Notifications (SendGrid)

Security alerts are sent as detailed HTML emails to admin@freqyn.com when critical events are detected.

### Setup

1. **Verify SendGrid API Key**
   - The `SENDGRID_API_KEY` secret should already be configured in Supabase
   - Emails are sent from `security@freqyn.com`

2. **Email Content**
   - Rich HTML formatting with color-coded severity levels
   - Event summary with counts
   - Detailed event tables
   - Direct links to Security Dashboard
   - Suspicious IP list with geographic data

### Email Triggers
- Critical security events (immediate)
- Threshold alerts (configurable)
- Auto-blocked IPs
- Manual alert checks

---

## Slack Webhook Integration

Real-time security alerts to your Slack workspace.

### Setup

1. **Create Slack App**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name: "Freqyn Security"
   - Select your workspace

2. **Enable Incoming Webhooks**
   - Go to "Incoming Webhooks" in sidebar
   - Toggle "Activate Incoming Webhooks" ON
   - Click "Add New Webhook to Workspace"
   - Select `#security-alerts` channel
   - Copy the webhook URL

3. **Add Secret to Supabase**
   ```bash
   supabase secrets set SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T.../B.../..."
   ```

4. **Test Integration**
   - Go to Security Dashboard
   - Click "Test Alerts" button
   - Check `#security-alerts` channel

---

## Custom Webhooks

Subscribe external services to security events with HMAC-signed payloads.

### Creating a Webhook

1. Go to Security Dashboard → Webhooks tab
2. Click "Add Webhook"
3. Enter:
   - **Name**: Descriptive name
   - **URL**: Your endpoint (https required)
   - **Events**: `all` or specific event types

### Webhook Payload

```json
{
  "event": "security_alert",
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "critical": 2,
    "alerts": 3,
    "suspicious": 5,
    "blocked": 1
  },
  "alerts": [
    { "type": "failed_login", "count": 15 }
  ],
  "suspicious_ips": [
    { "ip": "192.168.1.100", "count": 25, "geo": { "country_name": "Russia" } }
  ],
  "newly_blocked": ["192.168.1.100"]
}
```

### Security Headers

| Header | Description |
|--------|-------------|
| `X-Webhook-Signature` | HMAC-SHA256 signature of payload |
| `X-Webhook-Event` | Event type (e.g., `security_alert`) |
| `X-Webhook-Timestamp` | ISO timestamp |

### Verifying Signatures

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === expected;
}
```

### Retry Logic

Failed deliveries are retried with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 2 seconds
- Attempt 3: 4 seconds
- Attempt 4: 8 seconds
- Attempt 5: 16 seconds (final)

---

## Automated Scheduled Checks

Set up pg_cron to automatically check for security alerts every 5 minutes.

### Option 1: pg_cron (Recommended)

1. **Enable pg_cron Extension**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. **Create Scheduled Job**
   ```sql
   SELECT cron.schedule(
     'security-alert-check',
     '*/5 * * * *',  -- Every 5 minutes
     $$
     SELECT net.http_post(
       url := 'https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/security-alert-monitor',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
       ),
       body := jsonb_build_object('scheduled', true)
     );
     $$
   );
   ```

3. **Verify Job**
   ```sql
   SELECT * FROM cron.job;
   ```

### Option 2: External Cron Service

Use [cron-job.org](https://cron-job.org) or similar:

1. Create account at cron-job.org
2. Add new cron job:
   - **URL**: `https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/security-alert-monitor`
   - **Schedule**: Every 5 minutes
   - **Method**: POST
   - **Headers**:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_ANON_KEY`
   - **Body**: `{"scheduled": true}`

### Option 3: GitHub Actions

```yaml
# .github/workflows/security-check.yml
name: Security Alert Check
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Security Check
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -d '{"scheduled": true}' \
            https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/security-alert-monitor
```

---

## Rate Limiting Middleware

Sliding window rate limiting with automatic IP blocking.

### How It Works

1. **Check Request**
   ```javascript
   const { data } = await supabase.functions.invoke('rate-limit-middleware', {
     body: { action: 'check', endpoint: 'api', ip_address: clientIP }
   });
   
   if (!data.allowed) {
     // Return 429 Too Many Requests
   }
   ```

2. **Response Headers**
   - `X-RateLimit-Limit`: Requests allowed per minute
   - `X-RateLimit-Remaining`: Requests remaining
   - `X-RateLimit-Reset`: Unix timestamp when limit resets
   - `Retry-After`: Seconds until retry (when rate limited)

### Default Limits

| Endpoint | Per Minute | Per Hour | Burst |
|----------|------------|----------|-------|
| default | 60 | 1000 | 10 |
| auth | 10 | 100 | 3 |
| api | 100 | 2000 | 20 |
| upload | 10 | 50 | 2 |
| search | 30 | 500 | 5 |

### Auto-Blocking

- 5+ rate limit violations in 10 minutes → 1 hour block
- Violations logged to `security_audit_log`

---

## IP Blocking System

### Automatic Blocking

IPs are automatically blocked when:
- 20+ security events in 15 minutes → 24 hour block
- 5+ rate limit violations in 10 minutes → 1 hour block

### Manual Blocking

**Via Dashboard:**
1. Go to Security Dashboard → Blocked IPs
2. Enter IP address
3. Click "Block"

**Via API:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{"blockIp": "192.168.1.100", "reason": "Suspicious activity"}' \
  https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/security-alert-monitor
```

### Unblocking

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"unblockIp": "192.168.1.100"}' \
  https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/security-alert-monitor
```

---

## Geographic Blocking

Block access from specific countries using GeoIP lookup.

### GeoIP Service

Uses [ip-api.com](http://ip-api.com) free tier for IP geolocation:
- Country code and name
- City and region
- Latitude/longitude

### Blocking a Country

**Via Dashboard:**
1. Go to Security Dashboard → Geo-Blocking
2. Select country from dropdown
3. Click "Block"

**Via API:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"block_country": true, "country_code": "CN", "country_name": "China"}' \
  https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/security-alert-monitor
```

### Whitelisting IPs

Allow specific IPs to bypass geo-blocking:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"whitelist_ip": "192.168.1.100", "description": "Office VPN"}' \
  https://dqqdwnzrulmgnqrlhfdc.supabase.co/functions/v1/security-alert-monitor
```

---

## API Reference

### security-alert-monitor

| Action | Body | Description |
|--------|------|-------------|
| Check alerts | `{"manual": true}` | Trigger manual alert check |
| Test alerts | `{"test": true}` | Send test to all channels |
| Block IP | `{"blockIp": "x.x.x.x"}` | Block an IP |
| Unblock IP | `{"unblockIp": "x.x.x.x"}` | Unblock an IP |
| Check IP | `{"checkIp": "x.x.x.x"}` | Check if IP is blocked |
| Block country | `{"block_country": true, "country_code": "XX", "country_name": "Name"}` | Block country |
| Unblock country | `{"unblock_country": true, "country_code": "XX"}` | Unblock country |
| List webhooks | `{"action": "list_webhooks"}` | Get all webhooks |
| Create webhook | `{"action": "create_webhook", "webhook_name": "...", "webhook_url": "..."}` | Create webhook |
| Delete webhook | `{"action": "delete_webhook", "webhook_id": "..."}` | Delete webhook |
| Test webhook | `{"action": "test_webhook", "webhook_id": "..."}` | Test webhook |
| Get geo stats | `{"action": "get_geo_stats"}` | Get geographic statistics |

### rate-limit-middleware

| Action | Body | Description |
|--------|------|-------------|
| Check | `{"action": "check", "ip_address": "...", "endpoint": "..."}` | Check rate limit |
| Get limits | `{"action": "get_limits"}` | Get all rate limits |
| Update limit | `{"action": "update_limit", "endpoint": "...", ...}` | Update rate limit |
| Get stats | `{"action": "get_stats"}` | Get rate limit statistics |
| Cleanup | `{"action": "cleanup"}` | Clean old rate limit logs |

---

## Troubleshooting

### Slack Not Working

1. Verify webhook URL is correct
2. Check Supabase secrets: `supabase secrets list`
3. Test manually: `curl -X POST -d '{"text":"test"}' YOUR_WEBHOOK_URL`

### Emails Not Sending

1. Verify SendGrid API key
2. Check sender domain verification in SendGrid
3. Review SendGrid activity logs

### Rate Limiting Issues

1. Check `rate_limit_log` table for request counts
2. Verify endpoint name matches configuration
3. Clean up old logs: `{"action": "cleanup"}`

### Geo-Blocking Not Working

1. Verify IP is not in whitelist
2. Check `geo_events` table for lookups
3. Note: Private IPs (192.168.x.x, 10.x.x.x) are not geolocated

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `security_audit_log` | All security events |
| `security_alert_config` | Alert thresholds |
| `blocked_ips` | Blocked IP addresses |
| `blocked_countries` | Blocked countries |
| `whitelisted_ips` | IPs that bypass geo-blocking |
| `geo_events` | Geographic event data |
| `security_webhooks` | Webhook subscriptions |
| `webhook_deliveries` | Webhook delivery log |
| `rate_limits` | Rate limit configuration |
| `rate_limit_log` | Request tracking |

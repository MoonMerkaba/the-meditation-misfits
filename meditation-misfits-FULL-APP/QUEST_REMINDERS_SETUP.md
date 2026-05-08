# Quest Reminder Push Notifications Setup

## Overview
The quest reminder system sends push notifications to users who haven't completed their daily quests.

## Components Created
1. **Database Table**: `user_device_tokens` - stores push notification tokens
2. **Edge Function**: `send-quest-reminders` - checks for incomplete quests and sends notifications
3. **UI Component**: `QuestReminderSettings.tsx` - allows users to configure reminders

## Setup Instructions

### 1. Schedule the Edge Function
Set up a cron job to run the `send-quest-reminders` function daily at your desired time (e.g., 6pm):

```bash
# Using Supabase CLI
supabase functions schedule send-quest-reminders --cron "0 18 * * *"
```

Or manually trigger via HTTP:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-quest-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Notification Preferences Table
Create the notification_preferences table if it doesn't exist:

```sql
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_reminders BOOLEAN DEFAULT true,
  quest_reminder_time TEXT DEFAULT '18:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 3. Add to Notification Settings
Import QuestReminderSettings in your NotificationSettings component:

```tsx
import { QuestReminderSettings } from './QuestReminderSettings';

// Add to your settings page
<QuestReminderSettings />
```

## How It Works
1. Users enable push notifications and grant permission
2. Device tokens are stored in `user_device_tokens` table
3. Daily at scheduled time, edge function queries for incomplete quests
4. Notifications sent via FCM to users with incomplete quests
5. Users can tap notification to go to /daily-realm

## Testing
Manually invoke the function:
```bash
supabase functions invoke send-quest-reminders
```

## Environment Variables Required
- `FCM_SERVICE_ACCOUNT_JSON` - Firebase Cloud Messaging credentials (already configured)
- `SUPABASE_SERVICE_ROLE_KEY` - For database access (auto-configured)

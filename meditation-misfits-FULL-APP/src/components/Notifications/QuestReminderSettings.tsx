import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function QuestReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notification_preferences')
        .select('quest_reminders, quest_reminder_time')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setEnabled(data.quest_reminders ?? false);
        setReminderTime(data.quest_reminder_time ?? '18:00');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          quest_reminders: enabled,
          quest_reminder_time: reminderTime
        });

      if (error) throw error;
      toast.success('Quest reminder settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  }

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Daily Quest Reminders
        </CardTitle>
        <CardDescription>
          Get notified about incomplete daily quests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="quest-reminders">Enable Quest Reminders</Label>
          <Switch
            id="quest-reminders"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reminder Time
            </Label>
            <input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-sm text-muted-foreground">
              You'll receive a reminder at this time if you haven't completed your daily quest
            </p>
          </div>
        )}

        <Button onClick={saveSettings} className="w-full">
          Save Reminder Settings
        </Button>
      </CardContent>
    </Card>
  );
}

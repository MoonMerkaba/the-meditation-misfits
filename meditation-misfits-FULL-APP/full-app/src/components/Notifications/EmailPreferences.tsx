import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mail, Clock, TrendingUp, Sparkles, Users } from 'lucide-react';

interface EmailPrefs {
  daily_reminder: boolean;
  reminder_time: string;
  weekly_summary: boolean;
  milestone_alerts: boolean;
  frequency_drops: boolean;
  community_updates: boolean;
}

export function EmailPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<EmailPrefs>({
    daily_reminder: true,
    reminder_time: '09:00',
    weekly_summary: true,
    milestone_alerts: true,
    frequency_drops: true,
    community_updates: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPrefs(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('Email preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Notifications
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage how and when we send you email updates
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <Label htmlFor="daily_reminder" className="text-base font-medium">
                Daily Meditation Reminder
              </Label>
              <p className="text-sm text-muted-foreground">
                Get a daily reminder to practice meditation
              </p>
              {prefs.daily_reminder && (
                <Select value={prefs.reminder_time} onValueChange={(v) => setPrefs({ ...prefs, reminder_time: v })}>
                  <SelectTrigger className="w-32 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <Switch
            id="daily_reminder"
            checked={prefs.daily_reminder}
            onCheckedChange={(checked) => setPrefs({ ...prefs, daily_reminder: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <Label htmlFor="weekly_summary" className="text-base font-medium">
                Weekly Progress Summary
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly recap of your meditation journey
              </p>
            </div>
          </div>
          <Switch
            id="weekly_summary"
            checked={prefs.weekly_summary}
            onCheckedChange={(checked) => setPrefs({ ...prefs, weekly_summary: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <Label htmlFor="milestone_alerts" className="text-base font-medium">
                Milestone Achievements
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you reach important milestones
              </p>
            </div>
          </div>
          <Switch
            id="milestone_alerts"
            checked={prefs.milestone_alerts}
            onCheckedChange={(checked) => setPrefs({ ...prefs, milestone_alerts: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <Label htmlFor="frequency_drops" className="text-base font-medium">
                Daily Frequency Drops
              </Label>
              <p className="text-sm text-muted-foreground">
                New healing frequencies delivered to your inbox
              </p>
            </div>
          </div>
          <Switch
            id="frequency_drops"
            checked={prefs.frequency_drops}
            onCheckedChange={(checked) => setPrefs({ ...prefs, frequency_drops: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <Label htmlFor="community_updates" className="text-base font-medium">
                Community Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                News, events, and updates from the community
              </p>
            </div>
          </div>
          <Switch
            id="community_updates"
            checked={prefs.community_updates}
            onCheckedChange={(checked) => setPrefs({ ...prefs, community_updates: checked })}
          />
        </div>
      </div>

      <Button 
        onClick={savePreferences} 
        disabled={saving}
        className="w-full"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </Card>
  );
}

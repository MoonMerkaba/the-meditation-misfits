import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Sparkles } from 'lucide-react';
import { subscribeToPushNotifications } from '@/lib/pushNotifications';

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/New_York');
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
    checkPremiumStatus();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setEnabled(data.enabled);
      setTimezone(data.timezone);
      setPersonalized(data.personalized);
    }
  };

  const checkPremiumStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    setIsPremium(!!data);
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      // Register push token if enabling notifications
      if (enabled) {
        const token = await subscribeToPushNotifications();
        if (token) {
          await supabase.functions.invoke('register-push-token', {
            body: { platform: 'web', token }
          });
        }
      }

      const { error } = await supabase.functions.invoke('set-notification-prefs', {
        body: { enabled, timezone, time_local: time, personalized }
      });

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your notification settings have been updated.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            Daily Affirmations
          </CardTitle>
          <CardDescription>
            Receive uplifting prompts that deep-link to today's frequency drop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable notifications</Label>
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <Label>Notification time</Label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <div>
                    <Label htmlFor="personalized">Personalized affirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      {isPremium ? 'AI-tailored to your journey' : 'Premium only'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="personalized"
                  checked={personalized}
                  onCheckedChange={setPersonalized}
                  disabled={!isPremium}
                />
              </div>
            </>
          )}

          <Button onClick={savePreferences} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save preferences'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
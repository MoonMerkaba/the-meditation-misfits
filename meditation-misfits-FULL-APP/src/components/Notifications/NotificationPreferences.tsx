import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Smartphone, MessageCircle, Heart, Reply } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Preferences {
  email_comments: boolean;
  email_replies: boolean;
  email_likes: boolean;
  push_comments: boolean;
  push_replies: boolean;
  push_likes: boolean;
}

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Preferences>({
    email_comments: true,
    email_replies: true,
    email_likes: true,
    push_comments: true,
    push_replies: true,
    push_likes: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPrefs(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.'
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

  const updatePref = (key: keyof Preferences, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified about collection interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4" />
            Email Notifications
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="email_comments">New comments on your collections</Label>
              </div>
              <Switch
                id="email_comments"
                checked={prefs.email_comments}
                onCheckedChange={(v) => updatePref('email_comments', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="email_replies">Replies to your comments</Label>
              </div>
              <Switch
                id="email_replies"
                checked={prefs.email_replies}
                onCheckedChange={(v) => updatePref('email_replies', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="email_likes">Likes on your comments</Label>
              </div>
              <Switch
                id="email_likes"
                checked={prefs.email_likes}
                onCheckedChange={(v) => updatePref('email_likes', v)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="w-4 h-4" />
            Push Notifications
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="push_comments">New comments on your collections</Label>
              </div>
              <Switch
                id="push_comments"
                checked={prefs.push_comments}
                onCheckedChange={(v) => updatePref('push_comments', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="push_replies">Replies to your comments</Label>
              </div>
              <Switch
                id="push_replies"
                checked={prefs.push_replies}
                onCheckedChange={(v) => updatePref('push_replies', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="push_likes">Likes on your comments</Label>
              </div>
              <Switch
                id="push_likes"
                checked={prefs.push_likes}
                onCheckedChange={(v) => updatePref('push_likes', v)}
              />
            </div>
          </div>
        </div>

        <Button onClick={savePreferences} disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}

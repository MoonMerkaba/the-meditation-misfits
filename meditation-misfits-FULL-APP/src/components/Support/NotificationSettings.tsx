import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPrefs {
  newConversation: boolean;
  newMessage: boolean;
  urgentPriority: boolean;
  soundEnabled: boolean;
  soundType: 'chime' | 'bell' | 'pop';
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    newConversation: true,
    newMessage: true,
    urgentPriority: true,
    soundEnabled: true,
    soundType: 'chime',
    dndEnabled: false,
    dndStart: '22:00',
    dndEnd: '08:00'
  });

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPermission(Notification.permission);
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    const saved = localStorage.getItem('agentNotificationPrefs');
    if (saved) {
      setPrefs(JSON.parse(saved));
    }
  };

  const savePreferences = (newPrefs: NotificationPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('agentNotificationPrefs', JSON.stringify(newPrefs));
    toast.success('Notification preferences saved');
  };

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      toast.success('Notifications enabled');
    }
  };

  const testSound = () => {
    const audio = new Audio(`/sounds/${prefs.soundType}.mp3`);
    audio.play().catch(() => {
      // Fallback to system beep
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      oscillator.connect(context.destination);
      oscillator.frequency.value = 800;
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notification Settings</h3>
        </div>
        {permission !== 'granted' && (
          <Button onClick={requestPermission} size="sm">
            Enable Notifications
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Desktop Notifications</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="new-conv">New Conversations</Label>
            <Switch
              id="new-conv"
              checked={prefs.newConversation}
              onCheckedChange={(checked) => savePreferences({ ...prefs, newConversation: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="new-msg">New Messages</Label>
            <Switch
              id="new-msg"
              checked={prefs.newMessage}
              onCheckedChange={(checked) => savePreferences({ ...prefs, newMessage: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="urgent">Urgent Priority</Label>
            <Switch
              id="urgent"
              checked={prefs.urgentPriority}
              onCheckedChange={(checked) => savePreferences({ ...prefs, urgentPriority: checked })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm">Sound Alerts</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sound">Enable Sounds</Label>
            <Switch
              id="sound"
              checked={prefs.soundEnabled}
              onCheckedChange={(checked) => savePreferences({ ...prefs, soundEnabled: checked })}
            />
          </div>

          {prefs.soundEnabled && (
            <div className="flex items-center gap-2">
              <Select 
                value={prefs.soundType} 
                onValueChange={(value: any) => savePreferences({ ...prefs, soundType: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="bell">Bell</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={testSound}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm">Do Not Disturb</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dnd">Enable DND Mode</Label>
            <Switch
              id="dnd"
              checked={prefs.dndEnabled}
              onCheckedChange={(checked) => savePreferences({ ...prefs, dndEnabled: checked })}
            />
          </div>

          {prefs.dndEnabled && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start Time</Label>
                <input
                  type="time"
                  value={prefs.dndStart}
                  onChange={(e) => savePreferences({ ...prefs, dndStart: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <input
                  type="time"
                  value={prefs.dndEnd}
                  onChange={(e) => savePreferences({ ...prefs, dndEnd: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
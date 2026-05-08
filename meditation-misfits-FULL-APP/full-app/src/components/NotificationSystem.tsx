import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const NotificationSystem: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      const savedPref = localStorage.getItem('mm.notifications');
      setEnabled(savedPref === 'true' && Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        setEnabled(true);
        localStorage.setItem('mm.notifications', 'true');
        scheduleNotifications();
        new Notification('Meditation Misfits', {
          body: 'Notifications enabled! We\'ll remind you to stay on track.',
          icon: '/placeholder.svg'
        });
      }
    }
  };

  const scheduleNotifications = () => {
    // Schedule daily reminder
    const now = new Date();
    const reminder = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    const timeUntil = reminder.getTime() - now.getTime();
    
    setTimeout(() => {
      if (enabled && Notification.permission === 'granted') {
        new Notification('Time to Meditate', {
          body: 'Your daily session awaits. Keep your streak alive! 🔥',
          icon: '/placeholder.svg'
        });
      }
    }, timeUntil);
  };

  const toggleNotifications = () => {
    if (!enabled && permission !== 'granted') {
      requestPermission();
    } else {
      setEnabled(!enabled);
      localStorage.setItem('mm.notifications', (!enabled).toString());
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#FF00BF]" />
          Smart Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Daily Meditation Reminder</p>
            <p className="text-white/60 text-sm">Get notified at optimal times</p>
          </div>
          <Switch checked={enabled} onCheckedChange={toggleNotifications} />
        </div>

        {permission === 'denied' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
            <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-white text-sm">
              Notifications blocked. Enable in browser settings.
            </p>
          </div>
        )}

        {enabled && permission === 'granted' && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-white text-sm">
              You'll receive daily reminders to maintain your streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSystem;

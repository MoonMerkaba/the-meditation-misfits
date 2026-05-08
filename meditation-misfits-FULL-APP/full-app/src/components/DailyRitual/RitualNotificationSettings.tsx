import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Moon, Sun, Clock, Sparkles, Mail, Smartphone, Shield, Heart, Brain, Palette, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToPushNotifications } from '@/lib/pushNotifications';
import { 
  NOTIFICATION_MESSAGES, 
  requestNotificationPermissionWithFeedback,
  formatNotificationTime 
} from '@/lib/ritualNotifications';

interface NotificationPrefs {
  enabled: boolean;
  reminder_time: string;
  timezone: string;
  // Feature-specific notifications
  nervous_system_rescue_enabled: boolean;
  energy_checkin_enabled: boolean;
  daily_ritual_enabled: boolean;
  shadow_insights_enabled: boolean;
  ritual_builder_enabled: boolean;
  // Moon phase alerts
  moon_phase_alerts: boolean;
  new_moon_alert: boolean;
  full_moon_alert: boolean;
  streak_reminders: boolean;
  // Email preferences
  email_enabled: boolean;
  email_time: string;
  streak_warning_enabled: boolean;
  milestone_emails_enabled: boolean;
}

const timeOptions = [
  '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00'
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (AZ)' },
  { value: 'America/Anchorage', label: 'Alaska (AK)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HI)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' }
];

// Feature notification config with icons and preview messages
const featureNotifications = [
  {
    key: 'nervous_system_rescue_enabled' as const,
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    label: 'Nervous System Rescue',
    preview: NOTIFICATION_MESSAGES.nervous_system_rescue.body
  },
  {
    key: 'energy_checkin_enabled' as const,
    icon: Heart,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    label: 'Daily Energy Check-In',
    preview: NOTIFICATION_MESSAGES.energy_checkin.body
  },
  {
    key: 'daily_ritual_enabled' as const,
    icon: Sun,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    label: 'Daily Ritual',
    preview: NOTIFICATION_MESSAGES.daily_ritual.body
  },
  {
    key: 'shadow_insights_enabled' as const,
    icon: Eye,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    label: 'Shadow Pattern Insights',
    preview: NOTIFICATION_MESSAGES.shadow_insights.body
  },
  {
    key: 'ritual_builder_enabled' as const,
    icon: Palette,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    label: 'Ritual Builder',
    preview: NOTIFICATION_MESSAGES.ritual_builder.body
  }
];

export function RitualNotificationSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    enabled: false,
    reminder_time: '08:00',
    timezone: 'America/New_York',
    nervous_system_rescue_enabled: true,
    energy_checkin_enabled: true,
    daily_ritual_enabled: true,
    shadow_insights_enabled: true,
    ritual_builder_enabled: true,
    moon_phase_alerts: true,
    new_moon_alert: true,
    full_moon_alert: true,
    streak_reminders: true,
    email_enabled: false,
    email_time: '07:00',
    streak_warning_enabled: true,
    milestone_emails_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('push');
  const [permissionStatus, setPermissionStatus] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('ritual_notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setPrefs({
          enabled: data.enabled,
          reminder_time: data.reminder_time?.slice(0, 5) || '08:00',
          timezone: data.timezone || 'America/New_York',
          nervous_system_rescue_enabled: data.nervous_system_rescue_enabled ?? true,
          energy_checkin_enabled: data.energy_checkin_enabled ?? true,
          daily_ritual_enabled: data.daily_ritual_enabled ?? true,
          shadow_insights_enabled: data.shadow_insights_enabled ?? true,
          ritual_builder_enabled: data.ritual_builder_enabled ?? true,
          moon_phase_alerts: data.moon_phase_alerts,
          new_moon_alert: data.new_moon_alert,
          full_moon_alert: data.full_moon_alert,
          streak_reminders: data.streak_reminders,
          email_enabled: data.email_enabled || false,
          email_time: data.email_time?.slice(0, 5) || '07:00',
          streak_warning_enabled: data.streak_warning_enabled ?? true,
          milestone_emails_enabled: data.milestone_emails_enabled ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermissionWithFeedback();
    setPermissionStatus(result.message);
    
    if (result.granted) {
      setPrefs({ ...prefs, enabled: true });
      toast.success(result.message);
    } else {
      toast.info(result.message);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Request notification permission if enabling push
      if (prefs.enabled) {
        const token = await subscribeToPushNotifications();
        if (token) {
          await supabase.functions.invoke('register-push-token', {
            body: { token, type: 'ritual_reminder' }
          });
        }
      }

      const { error } = await supabase
        .from('ritual_notification_preferences')
        .upsert({
          user_id: user.id,
          enabled: prefs.enabled,
          reminder_time: prefs.reminder_time + ':00',
          timezone: prefs.timezone,
          nervous_system_rescue_enabled: prefs.nervous_system_rescue_enabled,
          energy_checkin_enabled: prefs.energy_checkin_enabled,
          daily_ritual_enabled: prefs.daily_ritual_enabled,
          shadow_insights_enabled: prefs.shadow_insights_enabled,
          ritual_builder_enabled: prefs.ritual_builder_enabled,
          moon_phase_alerts: prefs.moon_phase_alerts,
          new_moon_alert: prefs.new_moon_alert,
          full_moon_alert: prefs.full_moon_alert,
          streak_reminders: prefs.streak_reminders,
          email_enabled: prefs.email_enabled,
          email_time: prefs.email_time + ':00',
          streak_warning_enabled: prefs.streak_warning_enabled,
          milestone_emails_enabled: prefs.milestone_emails_enabled,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('Your preferences have been saved. We\'ll remind you gently.');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'We couldn\'t save your preferences, but you can try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          <Bell className="w-4 h-4 mr-2" />
          Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            Ritual Reminders
          </DialogTitle>
          <p className="text-sm text-white/60 mt-2">
            Choose how and when you'd like gentle reminders. No pressure — adjust anytime.
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 bg-white/5">
            <TabsTrigger value="push" className="data-[state=active]:bg-purple-500/20">
              <Smartphone className="w-4 h-4 mr-1" />
              Push
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-purple-500/20">
              <Mail className="w-4 h-4 mr-1" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Push Notifications Tab */}
          <TabsContent value="push" className="space-y-4 mt-4">
            {/* Main Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Push Notifications</p>
                  <p className="text-sm text-white/50">Get reminded on your device</p>
                </div>
              </div>
              {prefs.enabled ? (
                <Switch
                  checked={prefs.enabled}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, enabled: checked })}
                />
              ) : (
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                >
                  Enable
                </Button>
              )}
            </div>

            {permissionStatus && (
              <p className="text-sm text-white/60 italic px-2">{permissionStatus}</p>
            )}

            {prefs.enabled && (
              <>
                {/* Time Selection */}
                <div className="space-y-3">
                  <Label className="text-white/80 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Reminder Time
                  </Label>
                  <Select
                    value={prefs.reminder_time}
                    onValueChange={(value) => setPrefs({ ...prefs, reminder_time: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10 max-h-60">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time} className="text-white">
                          {formatNotificationTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/40">
                    Choose a time that feels natural for your practice.
                  </p>
                </div>

                {/* Timezone */}
                <div className="space-y-3">
                  <Label className="text-white/80 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Timezone
                  </Label>
                  <Select
                    value={prefs.timezone}
                    onValueChange={(value) => setPrefs({ ...prefs, timezone: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10 max-h-60">
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value} className="text-white">
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Feature-Specific Notifications */}
                <div className="space-y-3">
                  <Label className="text-white/80 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Feature Notifications
                  </Label>
                  <p className="text-xs text-white/40 mb-2">
                    Choose which reminders resonate with you. Turn off any that don't serve you.
                  </p>
                  <div className="space-y-2">
                    {featureNotifications.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div 
                          key={feature.key}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${feature.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${feature.color}`} />
                            </div>
                            <div>
                              <span className="text-sm text-white/80">{feature.label}</span>
                              <p className="text-xs text-white/40 mt-0.5">"{feature.preview}"</p>
                            </div>
                          </div>
                          <Switch
                            checked={prefs[feature.key]}
                            onCheckedChange={(checked) => setPrefs({ ...prefs, [feature.key]: checked })}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Moon Phase Alerts */}
                <div className="space-y-3">
                  <Label className="text-white/80 flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Moon Phase Alerts
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌑</span>
                        <div>
                          <span className="text-sm text-white/80">New Moon Alerts</span>
                          <p className="text-xs text-white/40">Time for new beginnings</p>
                        </div>
                      </div>
                      <Switch
                        checked={prefs.new_moon_alert}
                        onCheckedChange={(checked) => setPrefs({ ...prefs, new_moon_alert: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌕</span>
                        <div>
                          <span className="text-sm text-white/80">Full Moon Alerts</span>
                          <p className="text-xs text-white/40">Time for release and reflection</p>
                        </div>
                      </div>
                      <Switch
                        checked={prefs.full_moon_alert}
                        onCheckedChange={(checked) => setPrefs({ ...prefs, full_moon_alert: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Streak Reminders */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <div>
                      <span className="text-sm text-white/80">Streak Protection Reminders</span>
                      <p className="text-xs text-white/40">Gentle nudge before your streak breaks</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.streak_reminders}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, streak_reminders: checked })}
                  />
                </div>
              </>
            )}

            {/* Opt-out message */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-white/60 text-center">
                You can turn off any notification at any time.<br />
                Your practice is yours — reminders should support, not pressure.
              </p>
            </div>
          </TabsContent>

          {/* Email Notifications Tab */}
          <TabsContent value="email" className="space-y-4 mt-4">
            {/* Main Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Email Reminders</p>
                  <p className="text-sm text-white/50">Daily ritual emails with moon phase & prompts</p>
                </div>
              </div>
              <Switch
                checked={prefs.email_enabled}
                onCheckedChange={(checked) => setPrefs({ ...prefs, email_enabled: checked })}
              />
            </div>

            {prefs.email_enabled && (
              <>
                {/* Email Time Selection */}
                <div className="space-y-3">
                  <Label className="text-white/80 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Email Time
                  </Label>
                  <Select
                    value={prefs.email_time}
                    onValueChange={(value) => setPrefs({ ...prefs, email_time: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10 max-h-60">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time} className="text-white">
                          {formatNotificationTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/40">
                    Emails include today's element, moon phase, and shadow work prompt
                  </p>
                </div>

                {/* Streak Warning Emails */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    <div>
                      <span className="text-sm text-white/80">Streak Warning Emails</span>
                      <p className="text-xs text-white/40">Get notified before your streak breaks</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.streak_warning_enabled}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, streak_warning_enabled: checked })}
                  />
                </div>

                {/* Milestone Emails */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <div>
                      <span className="text-sm text-white/80">Milestone Celebration Emails</span>
                      <p className="text-xs text-white/40">Celebrate when you hit streak milestones</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.milestone_emails_enabled}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, milestone_emails_enabled: checked })}
                  />
                </div>

                {/* Email Preview */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10">
                  <p className="text-sm text-white/60 mb-2">Each email includes:</p>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Today's guiding element & energy</li>
                    <li>• Current moon phase & meaning</li>
                    <li>• Shadow work prompt preview</li>
                    <li>• Your current streak status</li>
                    <li>• Quick link to start your ritual</li>
                  </ul>
                </div>
              </>
            )}

            {/* Unsubscribe note */}
            <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <p className="text-xs text-white/60 text-center">
                Every email includes an unsubscribe link.<br />
                Your inbox should feel supportive, not cluttered.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 mt-4"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

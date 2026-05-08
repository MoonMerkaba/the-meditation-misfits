import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { X, Megaphone, Sparkles, AlertCircle, Info, Gift, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: number;
  starts_at: string;
  ends_at?: string;
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
    
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissed_announcements');
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)));
    }
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-ritual-announcements');
      if (data?.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAnnouncement = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed_announcements', JSON.stringify([...newDismissed]));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Sparkles className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'reward': return <Gift className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'event':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'alert':
        return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'reward':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
    }
  };

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a.id));

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`relative p-4 rounded-xl bg-gradient-to-r ${getTypeStyles(announcement.type)} border backdrop-blur-sm`}
        >
          <button
            onClick={() => dismissAnnouncement(announcement.id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
          
          <div className="flex items-start gap-3 pr-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              announcement.type === 'welcome' ? 'bg-purple-500/30 text-purple-300' :
              announcement.type === 'event' ? 'bg-blue-500/30 text-blue-300' :
              announcement.type === 'alert' ? 'bg-amber-500/30 text-amber-300' :
              announcement.type === 'reward' ? 'bg-yellow-500/30 text-yellow-300' :
              'bg-slate-500/30 text-slate-300'
            }`}>
              {getTypeIcon(announcement.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">{announcement.title}</h4>
              <p className="text-sm text-white/70">{announcement.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

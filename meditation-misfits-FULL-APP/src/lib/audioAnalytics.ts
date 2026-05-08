import { supabase } from './supabase';

export interface AudioUsageStats {
  filename: string;
  playCount: number;
  lastPlayed: Date;
}

// Default priority order based on common usage patterns
const DEFAULT_PRIORITY_ORDER = [
  'Classic-alpha-5-mins-(learning)-220-230.wav',
  'Classic-theta-5-mins-(meditation)-220-230.wav',
  'Classic-delta-5-mins-(sleep)-220-230.wav',
  'Classic-alpha-10-mins-(learning)-220-230.wav',
  'Classic-theta-10-mins-(meditation)-220-230.wav',
  'Classic-delta-10-mins-(sleep)-220-230.wav',
  'Classic-beta-5-mins-(focus)-220-230.wav',
  'Schumann-7.83hz-5-mins-220-230.wav',
  'Heart-639hz-5-mins-220-230.wav',
  'Classic-beta-10-mins-(focus)-220-230.wav',
  'Heart-639hz-10-mins-220-230.wav',
  'Root-396hz-5-mins-220-230.wav',
  'Classic-gamma-5-mins-(insight)-220-230.wav',
  'Jupiter-183hz-5-mins-220-230.wav',
  'Venus-221hz-5-mins-220-230.wav'
];

class AudioAnalytics {
  async trackPlay(filename: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.rpc('increment_audio_play_count', {
      p_user_id: user.id,
      p_filename: filename
    });

    if (error) {
      // Fallback: insert or update manually
      const { error: upsertError } = await supabase
        .from('audio_usage_analytics')
        .upsert({
          user_id: user.id,
          audio_filename: filename,
          play_count: 1,
          last_played_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,audio_filename'
        });

      if (upsertError) console.error('Failed to track audio play:', upsertError);
    }
  }

  async getUserStats(): Promise<AudioUsageStats[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('audio_usage_analytics')
      .select('audio_filename, play_count, last_played_at')
      .eq('user_id', user.id)
      .order('play_count', { ascending: false });

    if (error) {
      console.error('Failed to fetch audio stats:', error);
      return [];
    }

    return data.map(row => ({
      filename: row.audio_filename,
      playCount: row.play_count,
      lastPlayed: new Date(row.last_played_at)
    }));
  }

  async getPrioritizedOrder(allFiles: string[]): Promise<string[]> {
    const stats = await this.getUserStats();
    
    if (stats.length === 0) {
      return DEFAULT_PRIORITY_ORDER.filter(f => allFiles.includes(f));
    }

    const userPriority = stats.map(s => s.filename);
    const remaining = allFiles.filter(f => !userPriority.includes(f));
    
    return [...userPriority, ...remaining];
  }
}

export const audioAnalytics = new AudioAnalytics();

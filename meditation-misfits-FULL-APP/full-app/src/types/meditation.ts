export interface MeditationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface GuidedMeditation {
  id: string;
  title: string;
  description: string;
  category_id: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  voice_type: string;
  audio_url: string;
  background_music_url?: string;
  thumbnail_url?: string;
  is_premium: boolean;
  uploaded_by?: string;
  play_count: number;
  created_at: string;
  updated_at: string;
  category?: MeditationCategory;
}

export interface MeditationProgress {
  id: string;
  user_id: string;
  meditation_id: string;
  completed: boolean;
  completed_at?: string;
  last_position: number;
  play_count?: number;
  total_listen_time?: number;
  created_at: string;
  updated_at?: string;
}

export interface MeditationStats {
  totalCompleted: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string | null;
  categoryBreakdown: { category: string; count: number; minutes: number; color: string }[];
  weeklyProgress: { date: string; minutes: number; count: number }[];
  monthlyProgress: { month: string; minutes: number; count: number }[];
  streakCalendar: { date: string; completed: boolean }[];
  recentMeditations: { meditationId: string; title: string; completedAt: string; duration: number }[];
}

import { supabase } from './supabase';
import { GuidedMeditation, MeditationCategory, MeditationProgress } from '../types/meditation';

// Static meditation categories
const staticCategories: MeditationCategory[] = [
  {
    id: 'stress-relief',
    name: 'Stress Relief',
    description: 'Calm your mind and release tension',
    icon: '🧘',
    created_at: new Date().toISOString()
  },
  {
    id: 'sleep',
    name: 'Sleep & Rest',
    description: 'Drift into peaceful, restorative sleep',
    icon: '🌙',
    created_at: new Date().toISOString()
  },
  {
    id: 'focus',
    name: 'Focus & Clarity',
    description: 'Sharpen your mind and enhance concentration',
    icon: '🎯',
    created_at: new Date().toISOString()
  },
  {
    id: 'anxiety',
    name: 'Anxiety Relief',
    description: 'Find peace and calm anxious thoughts',
    icon: '💫',
    created_at: new Date().toISOString()
  },
  {
    id: 'self-love',
    name: 'Self-Love',
    description: 'Cultivate compassion and self-acceptance',
    icon: '💜',
    created_at: new Date().toISOString()
  },
  {
    id: 'energy',
    name: 'Energy & Vitality',
    description: 'Boost your energy and feel revitalized',
    icon: '⚡',
    created_at: new Date().toISOString()
  },
  {
    id: 'manifestation',
    name: 'Manifestation',
    description: 'Align with your desires and attract abundance',
    icon: '✨',
    created_at: new Date().toISOString()
  },
  {
    id: 'healing',
    name: 'Healing',
    description: 'Support your body and mind in healing',
    icon: '🌿',
    created_at: new Date().toISOString()
  }
];

// Static guided meditations
const staticMeditations: GuidedMeditation[] = [
  {
    id: 'med-1',
    title: 'Morning Calm',
    description: 'Start your day with peace and clarity. This gentle meditation helps you set positive intentions for the day ahead.',
    category_id: 'stress-relief',
    duration: 10,
    difficulty: 'beginner',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    is_premium: false,
    play_count: 1250,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-2',
    title: 'Deep Sleep Journey',
    description: 'A soothing meditation designed to guide you into deep, restorative sleep. Let go of the day and drift into peaceful rest.',
    category_id: 'sleep',
    duration: 30,
    difficulty: 'beginner',
    voice_type: 'male',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=400',
    is_premium: false,
    play_count: 3420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-3',
    title: 'Laser Focus',
    description: 'Enhance your concentration and mental clarity with this powerful focus meditation. Perfect before important tasks.',
    category_id: 'focus',
    duration: 15,
    difficulty: 'intermediate',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
    is_premium: true,
    play_count: 890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-4',
    title: 'Anxiety Release',
    description: 'Release anxious thoughts and find your center. This meditation uses breathing techniques to calm your nervous system.',
    category_id: 'anxiety',
    duration: 15,
    difficulty: 'beginner',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400',
    is_premium: false,
    play_count: 2100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-5',
    title: 'Self-Compassion Practice',
    description: 'Cultivate deep self-love and acceptance. Learn to treat yourself with the kindness you deserve.',
    category_id: 'self-love',
    duration: 20,
    difficulty: 'intermediate',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    is_premium: true,
    play_count: 1560,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-6',
    title: 'Energy Awakening',
    description: 'Revitalize your body and mind with this energizing meditation. Feel refreshed and ready to take on anything.',
    category_id: 'energy',
    duration: 10,
    difficulty: 'beginner',
    voice_type: 'male',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    is_premium: false,
    play_count: 980,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-7',
    title: 'Abundance Manifestation',
    description: 'Align your energy with abundance and prosperity. Visualize and attract the life you desire.',
    category_id: 'manifestation',
    duration: 20,
    difficulty: 'intermediate',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400',
    is_premium: true,
    play_count: 2340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-8',
    title: 'Body Scan Healing',
    description: 'A gentle body scan meditation to promote healing and release physical tension throughout your body.',
    category_id: 'healing',
    duration: 25,
    difficulty: 'beginner',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    is_premium: false,
    play_count: 1780,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-9',
    title: 'Quick Stress Reset',
    description: 'A short but powerful meditation to quickly reset your stress levels. Perfect for busy days.',
    category_id: 'stress-relief',
    duration: 5,
    difficulty: 'beginner',
    voice_type: 'male',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
    is_premium: false,
    play_count: 4200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-10',
    title: 'Bedtime Wind Down',
    description: 'Prepare your mind and body for sleep with this calming wind-down meditation.',
    category_id: 'sleep',
    duration: 15,
    difficulty: 'beginner',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=400',
    is_premium: false,
    play_count: 2890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-11',
    title: 'Deep Work Focus',
    description: 'Enter a state of deep focus and flow. Ideal for creative work and complex problem-solving.',
    category_id: 'focus',
    duration: 30,
    difficulty: 'advanced',
    voice_type: 'male',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    is_premium: true,
    play_count: 670,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-12',
    title: 'Panic Relief',
    description: 'Emergency meditation for moments of panic or overwhelming anxiety. Breathe and find your calm.',
    category_id: 'anxiety',
    duration: 5,
    difficulty: 'beginner',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400',
    is_premium: false,
    play_count: 5600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-13',
    title: 'Inner Child Healing',
    description: 'Connect with and heal your inner child. A powerful journey of self-discovery and compassion.',
    category_id: 'self-love',
    duration: 30,
    difficulty: 'advanced',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    is_premium: true,
    play_count: 1120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-14',
    title: 'Chakra Activation',
    description: 'Balance and activate your seven chakras for optimal energy flow and spiritual alignment.',
    category_id: 'energy',
    duration: 25,
    difficulty: 'intermediate',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
    is_premium: true,
    play_count: 1890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-15',
    title: 'Love Attraction',
    description: 'Open your heart to love and attract meaningful relationships into your life.',
    category_id: 'manifestation',
    duration: 20,
    difficulty: 'intermediate',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=400',
    is_premium: true,
    play_count: 2450,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'med-16',
    title: 'Emotional Healing',
    description: 'Process and release stored emotions. A gentle journey through emotional healing.',
    category_id: 'healing',
    duration: 30,
    difficulty: 'intermediate',
    voice_type: 'female',
    audio_url: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400',
    is_premium: true,
    play_count: 1340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Add category reference to meditations
const meditationsWithCategories = staticMeditations.map(med => ({
  ...med,
  category: staticCategories.find(cat => cat.id === med.category_id)
}));

// Local storage key for progress (fallback for non-authenticated users)
const PROGRESS_KEY = 'meditation_progress';

export async function fetchCategories(): Promise<MeditationCategory[]> {
  // Return static categories
  return Promise.resolve(staticCategories);
}

export async function fetchMeditations(filters?: {
  category?: string;
  duration?: number;
  difficulty?: string;
  search?: string;
}): Promise<GuidedMeditation[]> {
  let filtered = [...meditationsWithCategories];

  if (filters?.category) {
    filtered = filtered.filter(m => m.category_id === filters.category);
  }
  if (filters?.duration) {
    filtered = filtered.filter(m => m.duration === filters.duration);
  }
  if (filters?.difficulty) {
    filtered = filtered.filter(m => m.difficulty === filters.difficulty);
  }
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(m => 
      m.title.toLowerCase().includes(searchLower) ||
      m.description?.toLowerCase().includes(searchLower)
    );
  }

  return Promise.resolve(filtered);
}

/**
 * Fetch user's meditation progress from Supabase
 * Falls back to localStorage if user is not authenticated
 */
export async function fetchUserProgress(userId: string): Promise<MeditationProgress[]> {
  // First, try to get the current session to verify authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user?.id === userId) {
    // User is authenticated, fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('meditation_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching progress from Supabase:', error);
        // Fall back to localStorage
        return fetchLocalProgress(userId);
      }

      if (data && data.length > 0) {
        // Migrate any localStorage data to Supabase
        await migrateLocalProgressToSupabase(userId);
        return data as MeditationProgress[];
      }

      // Check if there's local data to migrate
      const localProgress = await fetchLocalProgress(userId);
      if (localProgress.length > 0) {
        await migrateLocalProgressToSupabase(userId);
        // Fetch again from Supabase after migration
        const { data: migratedData } = await supabase
          .from('meditation_progress')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        return (migratedData || []) as MeditationProgress[];
      }

      return [];
    } catch (error) {
      console.error('Error in fetchUserProgress:', error);
      return fetchLocalProgress(userId);
    }
  }

  // User not authenticated, use localStorage
  return fetchLocalProgress(userId);
}

/**
 * Fetch progress from localStorage (fallback)
 */
function fetchLocalProgress(userId: string): MeditationProgress[] {
  try {
    const stored = localStorage.getItem(`${PROGRESS_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading progress from localStorage:', error);
  }
  return [];
}

/**
 * Migrate localStorage progress to Supabase
 */
async function migrateLocalProgressToSupabase(userId: string): Promise<void> {
  try {
    const localProgress = fetchLocalProgress(userId);
    if (localProgress.length === 0) return;

    // Upsert each progress record to Supabase
    for (const progress of localProgress) {
      await supabase
        .from('meditation_progress')
        .upsert({
          user_id: userId,
          meditation_id: progress.meditation_id,
          completed: progress.completed,
          completed_at: progress.completed_at,
          last_position: progress.last_position,
          created_at: progress.created_at,
          updated_at: progress.updated_at || new Date().toISOString()
        }, {
          onConflict: 'user_id,meditation_id'
        });
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(`${PROGRESS_KEY}_${userId}`);
    console.log('Successfully migrated meditation progress to Supabase');
  } catch (error) {
    console.error('Error migrating progress to Supabase:', error);
  }
}

/**
 * Update user's meditation progress
 * Saves to Supabase if authenticated, otherwise localStorage
 */
export async function updateProgress(
  userId: string,
  meditationId: string,
  progress: Partial<MeditationProgress>
): Promise<void> {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user?.id === userId) {
    // User is authenticated, save to Supabase
    try {
      const updateData: Record<string, unknown> = {
        user_id: userId,
        meditation_id: meditationId,
        updated_at: new Date().toISOString()
      };

      // Only include fields that are provided
      if (progress.completed !== undefined) {
        updateData.completed = progress.completed;
        if (progress.completed) {
          updateData.completed_at = new Date().toISOString();
        }
      }
      if (progress.last_position !== undefined) {
        updateData.last_position = progress.last_position;
      }

      const { error } = await supabase
        .from('meditation_progress')
        .upsert(updateData, {
          onConflict: 'user_id,meditation_id'
        });

      if (error) {
        console.error('Error saving progress to Supabase:', error);
        // Fall back to localStorage
        updateLocalProgress(userId, meditationId, progress);
      }
    } catch (error) {
      console.error('Error in updateProgress:', error);
      updateLocalProgress(userId, meditationId, progress);
    }
  } else {
    // User not authenticated, save to localStorage
    updateLocalProgress(userId, meditationId, progress);
  }
}

/**
 * Update progress in localStorage (fallback)
 */
function updateLocalProgress(
  userId: string,
  meditationId: string,
  progress: Partial<MeditationProgress>
): void {
  try {
    const key = `${PROGRESS_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    let allProgress: MeditationProgress[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = allProgress.findIndex(p => p.meditation_id === meditationId);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = {
        ...allProgress[existingIndex],
        ...progress,
        updated_at: new Date().toISOString()
      } as MeditationProgress;
    } else {
      allProgress.push({
        id: `progress-${Date.now()}`,
        user_id: userId,
        meditation_id: meditationId,
        completed: false,
        last_position: 0,
        created_at: new Date().toISOString(),
        ...progress
      } as MeditationProgress);
    }
    
    localStorage.setItem(key, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
  }
}

/**
 * Mark a meditation as completed
 */
export async function markMeditationCompleted(
  userId: string,
  meditationId: string
): Promise<void> {
  await updateProgress(userId, meditationId, {
    completed: true,
    completed_at: new Date().toISOString()
  });
}

/**
 * Get user's meditation statistics with detailed breakdown
 */

export async function getUserMeditationStats(userId: string): Promise<{
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
}> {
  const progress = await fetchUserProgress(userId);
  const completedMeditations = progress.filter(p => p.completed);
  
  // Category colors for pie chart
  const categoryColors: Record<string, string> = {
    'stress-relief': '#8B5CF6',
    'sleep': '#3B82F6',
    'focus': '#F59E0B',
    'anxiety': '#10B981',
    'self-love': '#EC4899',
    'energy': '#F97316',
    'manifestation': '#6366F1',
    'healing': '#14B8A6'
  };
  
  // Calculate totals and category breakdown
  let totalMinutes = 0;
  const categoryCounts: Record<string, { count: number; minutes: number }> = {};
  
  for (const p of completedMeditations) {
    const meditation = staticMeditations.find(m => m.id === p.meditation_id);
    if (meditation) {
      totalMinutes += meditation.duration;
      if (!categoryCounts[meditation.category_id]) {
        categoryCounts[meditation.category_id] = { count: 0, minutes: 0 };
      }
      categoryCounts[meditation.category_id].count++;
      categoryCounts[meditation.category_id].minutes += meditation.duration;
    }
  }
  
  // Build category breakdown with names and colors
  const categoryBreakdown = Object.entries(categoryCounts).map(([categoryId, data]) => {
    const category = staticCategories.find(c => c.id === categoryId);
    return {
      category: category?.name || categoryId,
      count: data.count,
      minutes: data.minutes,
      color: categoryColors[categoryId] || '#6B7280'
    };
  }).sort((a, b) => b.count - a.count);
  
  // Find favorite category
  let favoriteCategory: string | null = null;
  if (categoryBreakdown.length > 0) {
    favoriteCategory = categoryBreakdown[0].category;
  }
  
  // Calculate weekly progress (last 7 days)
  const weeklyProgress: { date: string; minutes: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    let dayMinutes = 0;
    let dayCount = 0;
    
    for (const p of completedMeditations) {
      if (p.completed_at && p.completed_at.startsWith(dateStr)) {
        const meditation = staticMeditations.find(m => m.id === p.meditation_id);
        if (meditation) {
          dayMinutes += meditation.duration;
          dayCount++;
        }
      }
    }
    
    weeklyProgress.push({ date: dayName, minutes: dayMinutes, count: dayCount });
  }
  
  // Calculate monthly progress (last 6 months)
  const monthlyProgress: { month: string; minutes: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    let monthMinutes = 0;
    let monthCount = 0;
    
    for (const p of completedMeditations) {
      if (p.completed_at && p.completed_at.startsWith(monthStr)) {
        const meditation = staticMeditations.find(m => m.id === p.meditation_id);
        if (meditation) {
          monthMinutes += meditation.duration;
          monthCount++;
        }
      }
    }
    
    monthlyProgress.push({ month: monthName, minutes: monthMinutes, count: monthCount });
  }
  
  // Build streak calendar (last 30 days)
  const streakCalendar: { date: string; completed: boolean }[] = [];
  const completedDatesSet = new Set(
    completedMeditations
      .filter(p => p.completed_at)
      .map(p => p.completed_at!.split('T')[0])
  );
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    streakCalendar.push({
      date: dateStr,
      completed: completedDatesSet.has(dateStr)
    });
  }
  
  // Calculate streaks
  const sortedDates = Array.from(completedDatesSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (sortedDates.length > 0) {
    // Check if streak is active (today or yesterday)
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      currentStreak = 1;
      tempStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }
  
  // Get recent meditations
  const recentMeditations = completedMeditations
    .filter(p => p.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5)
    .map(p => {
      const meditation = staticMeditations.find(m => m.id === p.meditation_id);
      return {
        meditationId: p.meditation_id,
        title: meditation?.title || 'Unknown',
        completedAt: p.completed_at!,
        duration: meditation?.duration || 0
      };
    });
  
  return {
    totalCompleted: completedMeditations.length,
    totalMinutes,
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    favoriteCategory,
    categoryBreakdown,
    weeklyProgress,
    monthlyProgress,
    streakCalendar,
    recentMeditations
  };
}

export async function incrementPlayCount(meditationId: string): Promise<void> {
  // For static data, we just log this - in production this would update the database
  console.log('Play count incremented for meditation:', meditationId);
}

// Export static data for use in other components
export { staticCategories, staticMeditations };

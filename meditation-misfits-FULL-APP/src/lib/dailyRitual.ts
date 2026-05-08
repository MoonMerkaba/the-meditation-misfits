import { supabase } from './supabase';
import { invokeEdgeFunction } from './edgeFunctionHelper';


export interface DailyRitual {
  date: string;
  day_name: string;
  ritual_name: string;
  element: {
    name: string;
    description: string;
  };
  candle: {
    color: string;
    meaning: string;
    affirmation: string;
  };
  color_frequency: {
    color: string;
    benefits: string[];
  };
  tea: {
    blend: string;
    benefits: string;
  };
  essential_oil: {
    name: string;
    benefits: string[];
  };
  moon: {
    phase: string;
    emoji: string;
    illumination: number;
    description: string;
    energy_focus: string[];
    rituals_suggested: string[];
    manifestation_power: number;
    shadow_work_intensity: string;
  };
  zodiac: {
    current_season: { sign: string; emoji: string };
    user_sign: string;
    horoscope: string;
    focus_area: string;
    energy_level: string;
    lucky_number: number;
    power_hour: string;
  };
  shadow_work: {
    prompt: string;
    category: string;
    intensity: string;
    element: string;
  };
  recovery: {
    reminder: string;
    category: string;
  };
  altar: {
    theme: string;
    crystal: {
      name: string;
      color: string;
      element: string;
      chakra: string;
      properties: string[];
      healing_focus: string[];
      affirmation: string;
    };
  };
  breathwork: {
    inhale: number;
    hold: number;
    exhale: number;
    affirmation: string;
  };
  intention: string;
}

// Moon phase calculation
function getMoonPhase(date: Date): { phase: string; illumination: number; emoji: string } {
  const newMoon = new Date(2000, 0, 6, 18, 14, 0);
  const diff = date.getTime() - newMoon.getTime();
  const days = diff / 1000 / 60 / 60 / 24;
  const lunations = days / 29.53058867;
  const phase = lunations - Math.floor(lunations);
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
  
  let phaseName: string;
  let emoji: string;
  
  if (phase < 0.0625) { phaseName = 'New Moon'; emoji = '🌑'; }
  else if (phase < 0.1875) { phaseName = 'Waxing Crescent'; emoji = '🌒'; }
  else if (phase < 0.3125) { phaseName = 'First Quarter'; emoji = '🌓'; }
  else if (phase < 0.4375) { phaseName = 'Waxing Gibbous'; emoji = '🌔'; }
  else if (phase < 0.5625) { phaseName = 'Full Moon'; emoji = '🌕'; }
  else if (phase < 0.6875) { phaseName = 'Waning Gibbous'; emoji = '🌖'; }
  else if (phase < 0.8125) { phaseName = 'Last Quarter'; emoji = '🌗'; }
  else if (phase < 0.9375) { phaseName = 'Waning Crescent'; emoji = '🌘'; }
  else { phaseName = 'New Moon'; emoji = '🌑'; }
  
  return { phase: phaseName, illumination, emoji };
}

// Zodiac sign calculation
function getZodiacSign(date: Date): { sign: string; emoji: string } {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: 'Capricorn', emoji: '♑' };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: 'Aquarius', emoji: '♒' };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { sign: 'Pisces', emoji: '♓' };
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: 'Aries', emoji: '♈' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: 'Taurus', emoji: '♉' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: 'Gemini', emoji: '♊' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: 'Cancer', emoji: '♋' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: 'Leo', emoji: '♌' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: 'Virgo', emoji: '♍' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: 'Libra', emoji: '♎' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: 'Scorpio', emoji: '♏' };
  return { sign: 'Sagittarius', emoji: '♐' };
}

// Seeded random for consistent daily results
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export async function fetchDailyRitual(userZodiacSign?: string): Promise<DailyRitual> {
  const targetDate = new Date();
  const dayOfWeek = targetDate.getDay();
  const dateString = targetDate.toISOString().split('T')[0];
  const dateSeed = parseInt(dateString.replace(/-/g, ''));
  const random = seededRandom(dateSeed);
  
  const moonData = getMoonPhase(targetDate);
  const zodiacSeason = getZodiacSign(targetDate);
  const userSign = userZodiacSign || zodiacSeason.sign;

  // Fetch all data in parallel
  const [ritualRes, moonRes, shadowRes, recoveryRes, horoscopeRes, crystalRes] = await Promise.all([
    supabase.from('daily_ritual_sets').select('*').eq('day_of_week', dayOfWeek).single(),
    supabase.from('moon_phase_meanings').select('*').eq('phase_name', moonData.phase).single(),
    supabase.from('shadow_prompts').select('*'),
    supabase.from('recovery_reminders').select('*'),
    supabase.from('horoscope_templates').select('*').eq('zodiac_sign', userSign).single(),
    supabase.from('crystal_correspondences').select('*')
  ]);

  const ritualSet = ritualRes.data;
  const moonMeaning = moonRes.data;
  const shadowPrompts = shadowRes.data || [];
  const recoveryReminders = recoveryRes.data || [];
  const horoscope = horoscopeRes.data;
  const crystals = crystalRes.data || [];

  const shadowPrompt = shadowPrompts[Math.floor(random() * shadowPrompts.length)] || { prompt: '', category: '', intensity: '', element: '' };
  const recoveryReminder = recoveryReminders[Math.floor(random() * recoveryReminders.length)] || { reminder: '', category: '' };
  const crystal = crystals.find(c => c.name === ritualSet?.crystal_suggestion) || crystals[Math.floor(random() * crystals.length)] || {};

  return {
    date: dateString,
    day_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    ritual_name: ritualSet?.name || 'Daily Alignment',
    element: {
      name: ritualSet?.element_of_day || 'Spirit',
      description: ritualSet?.element_description || 'Connect with the universal energy that flows through all things.'
    },
    candle: {
      color: ritualSet?.candle_color || 'White',
      meaning: ritualSet?.candle_meaning || 'Represents purity, clarity, and divine connection',
      affirmation: 'I honor my past, empower my present, and command my future.'
    },
    color_frequency: {
      color: ritualSet?.color_frequency || 'Violet',
      benefits: ritualSet?.color_benefits || ['Spiritual connection', 'Intuition', 'Transformation']
    },
    tea: {
      blend: ritualSet?.tea_blend || 'Chamomile and lavender',
      benefits: ritualSet?.tea_benefits || 'Calms the nervous system and promotes inner peace'
    },
    essential_oil: {
      name: ritualSet?.essential_oil || 'Lavender',
      benefits: ritualSet?.oil_benefits || ['Calms anxiety', 'Promotes relaxation', 'Supports sleep']
    },
    moon: {
      phase: moonData.phase,
      emoji: moonData.emoji,
      illumination: moonData.illumination,
      description: moonMeaning?.description || 'The moon guides your emotional journey today.',
      energy_focus: moonMeaning?.energy_focus || ['Reflection', 'Intuition'],
      rituals_suggested: moonMeaning?.rituals_suggested || ['Meditation', 'Journaling'],
      manifestation_power: moonMeaning?.manifestation_power || 5,
      shadow_work_intensity: moonMeaning?.shadow_work_intensity || 'medium'
    },
    zodiac: {
      current_season: zodiacSeason,
      user_sign: userSign,
      horoscope: horoscope?.template || 'Trust your inner wisdom today. The universe supports your growth.',
      focus_area: horoscope?.focus_area || 'spiritual',
      energy_level: horoscope?.energy_level || 'medium',
      lucky_number: horoscope?.lucky_number || 7,
      power_hour: horoscope?.power_hour || '11:00 AM'
    },
    shadow_work: {
      prompt: shadowPrompt.prompt || 'What part of yourself are you ready to embrace today?',
      category: shadowPrompt.category || 'integration',
      intensity: shadowPrompt.intensity || 'gentle',
      element: shadowPrompt.element || 'Water'
    },
    recovery: {
      reminder: recoveryReminder.reminder || 'You are worthy of love and healing exactly as you are.',
      category: recoveryReminder.category || 'self-compassion'
    },
    altar: {
      theme: ritualSet?.altar_theme || 'Sacred Space',
      crystal: {
        name: crystal.name || 'Clear Quartz',
        color: crystal.color || 'Clear',
        element: crystal.element || 'Spirit',
        chakra: crystal.chakra || 'Crown',
        properties: crystal.properties || ['Amplification', 'Clarity', 'Healing'],
        healing_focus: crystal.healing_focus || ['Energy clearing', 'Spiritual connection'],
        affirmation: crystal.affirmation || 'I am a clear channel for divine light.'
      }
    },
    breathwork: {
      inhale: 4,
      hold: 2,
      exhale: 6,
      affirmation: 'I am safe. I am guided. I am becoming.'
    },
    intention: 'My spirit is older than my wounds. Today, I rise guided, grounded, and whole.'
  };
}

export async function saveRitualCompletion(userId: string, ritualDate: string, completedSections: string[], journalEntry?: string, moodBefore?: number, moodAfter?: number) {
  const { data, error } = await supabase
    .from('user_ritual_history')
    .upsert({
      user_id: userId,
      ritual_date: ritualDate,
      completed_sections: completedSections,
      journal_entry: journalEntry,
      mood_before: moodBefore,
      mood_after: moodAfter,
      completion_percentage: Math.round((completedSections.length / 10) * 100)
    }, { onConflict: 'user_id,ritual_date' });

  if (error) throw error;
  return data;
}

export async function getUserRitualPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_ritual_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function saveUserRitualPreferences(userId: string, preferences: {
  zodiac_sign?: string;
  preferred_element?: string;
  favorite_crystals?: string[];
  favorite_scents?: string[];
  notification_time?: string;
  receive_daily_ritual?: boolean;
}) {
  const { data, error } = await supabase
    .from('user_ritual_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) throw error;
  return data;
}

export async function getRitualStreak(userId: string) {

  const { data, error } = await invokeEdgeFunction('get-ritual-streak');
  if (error) throw new Error(error);
  return data;
}

export async function getSharedRitualContent(contentType?: string, limit = 20) {
  const { data, error } = await invokeEdgeFunction('share-ritual-content', { action: 'list', contentType, limit });
  if (error) throw new Error(error);
  return data?.content || [];
}

export async function shareRitualContent(contentType: string, contentText: string, isAnonymous = false) {
  const { data, error } = await invokeEdgeFunction('share-ritual-content', { action: 'share', contentType, contentText, isAnonymous });
  if (error) throw new Error(error);
  return data;
}

export async function toggleRitualContentResonance(contentId: string) {
  const { data, error } = await invokeEdgeFunction('share-ritual-content', { action: 'resonate', contentId });
  if (error) throw new Error(error);
  return data;
}

export async function toggleSaveRitualContent(contentId: string) {
  const { data, error } = await invokeEdgeFunction('share-ritual-content', { action: 'save', contentId });
  if (error) throw new Error(error);
  return data;
}

export async function getSavedRitualContent() {
  const { data, error } = await invokeEdgeFunction('share-ritual-content', { action: 'get_saved' });
  if (error) throw new Error(error);
  return data?.saved || [];
}

export async function getRitualCalendarData(month: number, year: number) {
  const { data, error } = await invokeEdgeFunction('get-ritual-calendar', { month, year });
  if (error) throw new Error(error);
  return data;
}

export async function getRitualLeaderboard(type: 'streak' | 'completions' | 'resonance' = 'streak', period: 'all' | 'weekly' | 'monthly' = 'all') {
  const { data, error } = await invokeEdgeFunction('get-ritual-leaderboard', { type, period });
  if (error) throw new Error(error);
  return data;
}


// Altar functions
export async function saveAltarDesign(design: {
  name: string;
  description?: string;
  objects: any[];
  background: string;
  isPublic: boolean;
  moonPhase?: string;
  element?: string;
}) {
  const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'save', ...design });
  if (error) throw new Error(error);
  return data;
}

export async function getUserAltars() {
  const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'list' });
  if (error) throw new Error(error);
  return data?.altars || [];
}

export async function getPublicAltars() {
  const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'get_public' });
  if (error) throw new Error(error);
  return data?.altars || [];
}

export async function getAltarObjects() {
  const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'get_objects' });
  if (error) throw new Error(error);
  return data?.objects || [];
}

export async function getAltarSuggestions(moonPhase: string, element: string) {
  const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'get_suggestions', moonPhase, element });
  if (error) throw new Error(error);
  return data?.suggestions || [];
}

// Announcement functions
export async function getAnnouncements() {
  const { data, error } = await invokeEdgeFunction('get-ritual-announcements');
  if (error) throw new Error(error);
  return data?.announcements || [];
}



// TTS Narration functions
export async function generateRitualNarration(ritualContent: {
  shadow_prompt?: string;
  recovery_reminder?: string;
  intention?: string;
  breathwork_guide?: string;
  affirmation?: string;
}, voiceStyle: 'calm_female' | 'soothing_male' | 'mystical' = 'calm_female', speakingSpeed: number = 1.0) {
  const { data, error } = await invokeEdgeFunction('generate-ritual-narration', {
    ritual_content: ritualContent,
    voice_style: voiceStyle,
    speaking_speed: speakingSpeed,
    include_background_music: true
  });
  if (error) throw new Error(error);
  return data;
}

// Crystal Collection functions
export async function getCrystalCollection() {
  const { data, error } = await invokeEdgeFunction('manage-crystal-collection', { action: 'list' });
  if (error) throw new Error(error);
  return data?.crystals || [];
}

export async function addCrystalToCollection(crystalData: {
  name: string;
  description?: string;
  photo_url?: string;
  purchase_date?: string;
  purchase_location?: string;
  properties?: string[];
  chakras?: string[];
  elements?: string[];
  moon_phases?: string[];
  cleansing_interval_days?: number;
  notes?: string;
}) {
  const { data, error } = await invokeEdgeFunction('manage-crystal-collection', { action: 'add', crystal_data: crystalData });
  if (error) throw new Error(error);
  return data?.crystal;
}

export async function updateCrystal(crystalId: string, crystalData: any) {
  const { data, error } = await invokeEdgeFunction('manage-crystal-collection', { action: 'update', crystal_id: crystalId, crystal_data: crystalData });
  if (error) throw new Error(error);
  return data?.crystal;
}

export async function deleteCrystal(crystalId: string) {
  const { data, error } = await invokeEdgeFunction('manage-crystal-collection', { action: 'delete', crystal_id: crystalId });
  if (error) throw new Error(error);
  return data;
}

export async function markCrystalCleansed(crystalId: string) {
  const { data, error } = await invokeEdgeFunction('manage-crystal-collection', { action: 'mark_cleansed', crystal_id: crystalId });
  if (error) throw new Error(error);
  return data?.crystal;
}

export async function getCrystalSuggestions(moonPhase: string, element: string, intentions?: string[]) {
  const { data, error } = await invokeEdgeFunction('manage-crystal-collection', { action: 'get_suggestions', moon_phase: moonPhase, element, intentions });
  if (error) throw new Error(error);
  return data;
}

export async function identifyCrystal(crystalName: string) {
  const { data, error } = await invokeEdgeFunction('manage-crystal-collection', { action: 'identify', crystal_data: { name: crystalName } });
  if (error) throw new Error(error);
  return data;
}

// Lunar Calendar functions
export async function getLunarEvents(startDate?: string, endDate?: string) {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'get_events', start_date: startDate, end_date: endDate });
  if (error) throw new Error(error);
  return data?.events || [];
}

export async function getUserMoonRituals() {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'get_user_rituals' });
  if (error) throw new Error(error);
  return data?.rituals || [];
}

export async function saveMoonRitual(ritualData: {
  moon_phase: string;
  title: string;
  description?: string;
  ritual_steps?: string[];
  crystals?: string[];
  candles?: string[];
  intentions?: string;
  duration_minutes?: number;
}, ritualId?: string) {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'save_ritual', ritual_id: ritualId, ritual_data: ritualData });
  if (error) throw new Error(error);
  return data?.ritual;
}

export async function deleteMoonRitual(ritualId: string) {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'delete_ritual', ritual_id: ritualId });
  if (error) throw new Error(error);
  return data;
}

export async function getGroupRituals() {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'get_group_rituals' });
  if (error) throw new Error(error);
  return data?.group_rituals || [];
}

export async function joinGroupRitual(ritualId: string) {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'join_group_ritual', ritual_id: ritualId });
  if (error) throw new Error(error);
  return data;
}

export async function leaveGroupRitual(ritualId: string) {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'leave_group_ritual', ritual_id: ritualId });
  if (error) throw new Error(error);
  return data;
}

export async function getLiveParticipants(ritualId: string) {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'get_live_participants', ritual_id: ritualId });
  if (error) throw new Error(error);
  return data?.participants || [];
}

export async function sendHeartbeat(ritualId: string) {
  const { data, error } = await invokeEdgeFunction('manage-lunar-calendar', { action: 'heartbeat', ritual_id: ritualId });
  if (error) throw new Error(error);
  return data;
}



// Energy Check-In functions
export async function saveEnergyCheckIn(checkInData: {
  energy_level: number;
  emotional_state: number;
  mental_clarity: number;
  notes?: string;
  moon_phase?: string;
  element?: string;
}) {
  const { data, error } = await invokeEdgeFunction('manage-energy-checkin', { action: 'save', ...checkInData });
  if (error) throw new Error(error);
  return data;
}

export async function getTodayEnergyCheckIn() {
  const { data, error } = await invokeEdgeFunction('manage-energy-checkin', { action: 'get_today' });
  if (error) throw new Error(error);
  return data?.checkin;
}

export async function getEnergyCheckInHistory(limit = 30) {
  const { data, error } = await invokeEdgeFunction('manage-energy-checkin', { action: 'get_history', limit });
  if (error) throw new Error(error);
  return data?.history || [];
}

export async function getEnergyTrends(days = 30) {
  const { data, error } = await invokeEdgeFunction('manage-energy-checkin', { action: 'get_trends', days });
  if (error) throw new Error(error);
  return data?.trends;
}

// Shadow Pattern functions
export async function analyzeShadowPatterns() {
  const { data, error } = await invokeEdgeFunction('analyze-shadow-patterns', { action: 'analyze' });
  if (error) throw new Error(error);
  return data;
}

export async function getStoredShadowPatterns() {
  const { data, error } = await invokeEdgeFunction('analyze-shadow-patterns', { action: 'get_patterns' });
  if (error) throw new Error(error);
  return data?.patterns || [];
}

// Custom Ritual functions
export async function saveCustomRitual(ritualData: {
  name: string;
  description?: string;
  elements: any[];
  is_public?: boolean;
}, ritualId?: string) {
  const { data, error } = await invokeEdgeFunction('manage-custom-ritual', { 
    action: ritualId ? 'update' : 'save',
    id: ritualId,
    ...ritualData
  });
  if (error) throw new Error(error);
  return data?.ritual;
}

export async function getCustomRituals() {
  const { data, error } = await invokeEdgeFunction('manage-custom-ritual', { action: 'list' });
  if (error) throw new Error(error);
  return data?.rituals || [];
}

export async function deleteCustomRitual(ritualId: string) {
  const { data, error } = await invokeEdgeFunction('manage-custom-ritual', { action: 'delete', id: ritualId });
  if (error) throw new Error(error);
  return data;
}

export async function browsePublicRituals(limit = 20) {
  const { data, error } = await invokeEdgeFunction('manage-custom-ritual', { action: 'browse_public', limit });
  if (error) throw new Error(error);
  return data?.rituals || [];
}

// Grounding Session functions
export async function saveGroundingSession(sessionData: {
  trigger_reason?: string;
  duration_seconds: number;
  technique_used: string;
  effectiveness_rating?: number;
  notes?: string;
}) {
  const { data, error } = await invokeEdgeFunction('save-grounding-session', { action: 'save', ...sessionData });
  if (error) throw new Error(error);
  return data?.session;
}

export async function getGroundingStats() {
  const { data, error } = await invokeEdgeFunction('save-grounding-session', { action: 'get_stats' });
  if (error) throw new Error(error);
  return data?.stats;
}


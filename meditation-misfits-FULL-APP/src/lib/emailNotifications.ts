import { supabase } from './supabase';

export const sendMilestoneEmail = async (
  userId: string,
  milestone: string,
  description: string
) => {
  try {
    // Check if user has milestone alerts enabled
    const { data: prefs } = await supabase
      .from('email_preferences')
      .select('milestone_alerts')
      .eq('user_id', userId)
      .single();

    if (!prefs?.milestone_alerts) {
      return; // User has disabled milestone alerts
    }

    // Send email via edge function
    const { error } = await supabase.functions.invoke('milestone-alert', {
      body: { userId, milestone, description }
    });

    if (error) {
      console.error('Error sending milestone email:', error);
    }
  } catch (error) {
    console.error('Error in sendMilestoneEmail:', error);
  }
};

export const MILESTONES = {
  FIRST_SESSION: {
    name: 'First Meditation Session',
    description: 'You completed your first meditation session! Welcome to your journey.'
  },
  STREAK_7: {
    name: '7-Day Streak',
    description: 'You\'ve meditated for 7 days in a row! Your consistency is building powerful momentum.'
  },
  STREAK_30: {
    name: '30-Day Streak',
    description: 'An incredible 30-day streak! You\'re creating lasting transformation.'
  },
  SESSIONS_10: {
    name: '10 Sessions Complete',
    description: 'You\'ve completed 10 meditation sessions. Your practice is growing stronger.'
  },
  SESSIONS_50: {
    name: '50 Sessions Complete',
    description: 'Wow! 50 sessions completed. You\'re a dedicated practitioner.'
  },
  SESSIONS_100: {
    name: '100 Sessions Complete',
    description: 'A century of sessions! Your commitment to growth is truly inspiring.'
  },
  FIRST_WIN: {
    name: 'First Manifestation Win',
    description: 'You logged your first win! The universe is responding to your energy.'
  },
  WINS_10: {
    name: '10 Wins Manifested',
    description: '10 wins and counting! You\'re becoming a manifestation master.'
  }
};

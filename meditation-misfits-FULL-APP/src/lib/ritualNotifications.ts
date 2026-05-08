// Ritual Notification Messages - Compassionate, supportive wording
export const NOTIFICATION_MESSAGES = {
  nervous_system_rescue: {
    title: 'Grounding Space Ready',
    body: 'Feeling overwhelmed? Your grounding space is ready.',
    icon: '🛑',
    tag: 'nervous-system-rescue'
  },
  energy_checkin: {
    title: 'Daily Check-In',
    body: 'Take 30 seconds to check in with yourself today.',
    icon: '🌡️',
    tag: 'energy-checkin'
  },
  daily_ritual: {
    title: 'Your Ritual Awaits',
    body: 'Your personalized ritual for today is ready.',
    icon: '🌕',
    tag: 'daily-ritual'
  },
  shadow_insights: {
    title: 'New Patterns Emerged',
    body: 'New patterns have emerged from your reflections.',
    icon: '🌑',
    tag: 'shadow-insights'
  },
  ritual_builder: {
    title: 'Your Rituals',
    body: 'Your saved rituals are waiting for you.',
    icon: '🧿',
    tag: 'ritual-builder'
  },
  streak_reminder: {
    title: 'Protect Your Streak',
    body: "Your streak is at risk. A moment of presence is all you need.",
    icon: '🔥',
    tag: 'streak-reminder'
  },
  new_moon: {
    title: 'New Moon Tonight',
    body: 'A time for new beginnings. Set your intentions.',
    icon: '🌑',
    tag: 'new-moon'
  },
  full_moon: {
    title: 'Full Moon Tonight',
    body: 'A time for release and reflection. What are you ready to let go?',
    icon: '🌕',
    tag: 'full-moon'
  }
};

export type NotificationType = keyof typeof NOTIFICATION_MESSAGES;

// Schedule notification for a specific time
export function scheduleNotification(
  type: NotificationType,
  scheduledTime: Date
): void {
  const message = NOTIFICATION_MESSAGES[type];
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      showNotification(type);
    }, delay);
  }
}

// Show notification immediately
export async function showNotification(type: NotificationType): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  const message = NOTIFICATION_MESSAGES[type];

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(message.title, {
      body: message.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: message.tag,
      renotify: true,
      data: { type, url: '/daily-ritual' }
    });
    return true;
  } catch (error) {
    // Fallback to basic notification
    new Notification(message.title, {
      body: message.body,
      icon: '/favicon.ico',
      tag: message.tag
    });
    return true;
  }
}

// Check if notifications are supported and enabled
export function canShowNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Request notification permission with user-friendly handling
export async function requestNotificationPermissionWithFeedback(): Promise<{
  granted: boolean;
  message: string;
}> {
  if (!('Notification' in window)) {
    return {
      granted: false,
      message: 'Your browser doesn\'t support notifications. You can still use all features.'
    };
  }

  if (Notification.permission === 'granted') {
    return {
      granted: true,
      message: 'Notifications are enabled. We\'ll gently remind you.'
    };
  }

  if (Notification.permission === 'denied') {
    return {
      granted: false,
      message: 'Notifications are blocked. You can enable them in your browser settings when ready.'
    };
  }

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    return {
      granted: true,
      message: 'Thank you. We\'ll send gentle reminders at your chosen time.'
    };
  }

  return {
    granted: false,
    message: 'No pressure. You can enable notifications anytime from settings.'
  };
}

// Calculate next notification time based on user preferences
export function getNextNotificationTime(
  preferredTime: string,
  timezone: string
): Date {
  const [hours, minutes] = preferredTime.split(':').map(Number);
  const now = new Date();
  
  // Create date in user's timezone
  const targetDate = new Date();
  targetDate.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  return targetDate;
}

// Format time for display
export function formatNotificationTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

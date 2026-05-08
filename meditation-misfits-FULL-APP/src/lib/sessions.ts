import { Session } from '../types/session';

const R2_BASE = import.meta.env.VITE_R2_BASE || '';

const FALLBACK_SESSIONS: Session[] = [
  { key: 'grounding', title: 'Grounding (ADHD Reset)', tag: '7–10 min', url: '/audio/grounding.mp3', desc: 'Reset scattered energy' },
  { key: 'calm', title: 'Calm Sleep Aid', tag: '15 min', url: '/audio/calm.mp3', desc: 'Deep restful sleep' },
  { key: 'shadow', title: 'Shadow Integration', tag: '12 min', url: '/audio/shadow.mp3', desc: 'Face your inner depths' },
  { key: 'focus', title: 'Focus Flow', tag: '10 min', url: '/audio/focus.mp3', desc: 'Enhanced concentration' }
];

export async function fetchSessions(): Promise<Session[]> {
  if (!R2_BASE) return FALLBACK_SESSIONS;
  try {
    const res = await fetch(`${R2_BASE}/sessions.json`);
    if (!res.ok) return FALLBACK_SESSIONS;
    return await res.json();
  } catch {
    return FALLBACK_SESSIONS;
  }
}

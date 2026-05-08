export type Session = {
  key: string
  title: string
  tag?: string
  url: string
  desc?: string
}

type StartJourneyDeps = {
  // REQUIRED: plays the session and resolves when audio ends
  playSession: (s: Session) => Promise<void>
  // OPTIONAL: show the daily card UI (no-op if already set today)
  showDailyCard?: () => void
  // OPTIONAL: open journal modal for this session
  openJournal?: (sessionKey: string) => void
  // OPTIONAL: mark a level complete (L1..)
  completeLevel?: (id: string) => void
  // OPTIONAL: achievements/stats
  incrementStat?: (path: string, by?: number) => void
  updateStreak?: () => void
  renderBadges?: () => void
}

const TODAY = () => new Date().toISOString().slice(0,10)

const getStats = () => JSON.parse(localStorage.getItem('mm.stats') || '{}')
const setStats = (s: any) => localStorage.setItem('mm.stats', JSON.stringify(s))
export function recommendSession(sessions: Session[]): { session: Session; reason: string } {
  // Simple, sensible recommendation with reasoning
  const hour = new Date().getHours()
  const byKey = (k: string) => sessions.find(s => s.key.toLowerCase().includes(k))
  
  if (hour < 12) {
    return {
      session: byKey('focus') || sessions[0],
      reason: "Morning energy: Focus & clarity to start your day with intention."
    }
  }
  if (hour >= 20) {
    return {
      session: byKey('calm') || byKey('sleep') || sessions[0],
      reason: "Evening wind-down: Calm & rest to prepare for deep sleep."
    }
  }
  return {
    session: byKey('manifest') || byKey('ground') || sessions[0],
    reason: "Afternoon alignment: Manifestation & grounding for receptivity."
  }
}


export async function startDailyJourney(
  sessions: Session[],
  deps: StartJourneyDeps
) {
  const { playSession, showDailyCard, openJournal, completeLevel, incrementStat, updateStreak, renderBadges } = deps

  // 1) Show/lock in today's Resonance card (if you have that component)
  try { showDailyCard?.() } catch {}


  // 2) Pick the recommended session
  const recommendation = recommendSession(sessions)

  // 3) Play it and wait until it ends
  await playSession(recommendation.session)

  // 4) Nudge journaling (private, local)
  try { openJournal?.(recommendation.session.key) } catch {}

  // 5) Progress + Achievements
  //   - mark a lightweight level as complete (e.g., L1 on first journey)
  try { completeLevel?.('L1') } catch {}
  try {
    incrementStat?.('plays.total', 1)
    incrementStat?.(`plays.byKey.${recommendation.session.key}`, 1)
    updateStreak?.()
    renderBadges?.()
  } catch {}

  // 6) Store the last journey date
  const stats = getStats()
  stats.lastJourneyDate = TODAY()
  setStats(stats)
  
  return recommendation.reason
}


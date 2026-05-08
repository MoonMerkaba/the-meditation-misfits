import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { storage } from '../../lib/storage';
import { Trophy, Lock } from 'lucide-react';

const BADGES = [
  { id: 'first', title: 'First Note', check: (s: any) => s.plays.total >= 1 },
  { id: 'triad', title: 'Triad', check: (s: any) => s.plays.total >= 3 },
  { id: 'decagon', title: 'Decagon', check: (s: any) => s.plays.total >= 10 },
  { id: 'streak2', title: 'Streak x2', check: (s: any) => s.streak >= 2 },
  { id: 'streak7', title: 'Streak x7', check: (s: any) => s.streak >= 7 },
  { id: 'night', title: 'Night Owl', check: (s: any) => (s.plays.byKey.calm || 0) >= 3 },
  { id: 'shadow', title: 'Shadow Diver', check: (s: any) => (s.plays.byKey.shadow || 0) >= 3 }
];

export default function Achievements() {
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    const stats = storage.get('mm.stats') || { plays: { total: 0, byKey: {} }, streak: 0 };
    const earned = BADGES.filter(b => b.check(stats)).map(b => b.id);
    setUnlocked(earned);
  }, []);

  return (
    <Card className="p-6 bg-card border-purple-500/30">
      <h2 className="text-2xl font-bold text-pink-400 mb-4">Achievements</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {BADGES.map((badge) => (
          <div
            key={badge.id}
            className={`p-4 rounded-lg text-center ${
              unlocked.includes(badge.id)
                ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/50'
                : 'bg-card-2 border border-gray-700 opacity-50'
            }`}
          >
            {unlocked.includes(badge.id) ? (
              <Trophy className="mx-auto mb-2 text-yellow-400" size={32} />
            ) : (
              <Lock className="mx-auto mb-2 text-gray-500" size={32} />
            )}
            <p className="text-sm font-semibold">{badge.title}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { storage } from '../../lib/storage';
import { CheckCircle, Circle, Lightbulb } from 'lucide-react';

const LEVELS = [
  { id: 1, title: 'The Static Drain', hint: 'Start with grounding to clear mental fog.' },
  { id: 2, title: 'Touch of Tranquility', hint: 'Try the calm session before sleep.' },
  { id: 3, title: 'Resonant Rise', hint: 'Explore binaural beats for focus.' },
  { id: 4, title: 'Astral Gateway', hint: 'Combine sessions for deeper work.' }
];

export default function Pathways() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<number | null>(null);

  useEffect(() => {
    const saved = storage.get('mm.levels') || [];
    setCompleted(saved);
  }, []);

  const toggleComplete = (id: number) => {
    const newCompleted = completed.includes(id)
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    storage.set('mm.levels', newCompleted);
  };

  const resetProgress = () => {
    setCompleted([]);
    storage.remove('mm.levels');
    storage.remove('mm.stats');
  };

  return (
    <Card className="p-6 bg-card border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-pink-400">Misfit Pathways</h2>
        <Button onClick={resetProgress} variant="outline" size="sm">Reset</Button>
      </div>
      <div className="space-y-3">
        {LEVELS.map((level) => (
          <div key={level.id} className="flex items-center gap-3 p-3 bg-card-2 rounded-lg">
            <button onClick={() => toggleComplete(level.id)}>
              {completed.includes(level.id) ? (
                <CheckCircle className="text-green-400" size={24} />
              ) : (
                <Circle className="text-gray-500" size={24} />
              )}
            </button>
            <div className="flex-1">
              <h3 className="font-semibold">L{level.id} {level.title}</h3>
            </div>
            <Button
              onClick={() => setShowHint(showHint === level.id ? null : level.id)}
              variant="ghost"
              size="sm"
            >
              <Lightbulb size={16} />
            </Button>
            {showHint === level.id && (
              <p className="text-sm text-gray-400 col-span-3 mt-2">{level.hint}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

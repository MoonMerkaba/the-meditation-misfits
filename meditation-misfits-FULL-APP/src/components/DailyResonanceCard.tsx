import React, { useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { Button } from './ui/button';
import { Card } from './ui/card';

const MESSAGES = [
  "Your frequency is perfect exactly as it is.",
  "Every breath recalibrates your energy field.",
  "You are the conductor of your own symphony.",
  "Chaos is just creativity waiting to be channeled.",
  "Your nervous system is learning to dance, not fight."
];

export default function DailyResonanceCard() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = storage.get('mm.daily');
    if (saved?.date === today) {
      setMessage(saved.text);
    } else {
      const newMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      storage.set('mm.daily', { date: today, text: newMsg });
      setMessage(newMsg);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: message });
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-pink-500/30">
      <h3 className="text-xl font-bold mb-3 text-pink-400">Daily Resonance</h3>
      <p className="text-lg mb-4 italic">{message}</p>
      <div className="flex gap-2">
        <Button onClick={handleCopy} variant="outline" size="sm">Copy</Button>
        <Button onClick={handleShare} variant="outline" size="sm">Share</Button>
      </div>
    </Card>
  );
}

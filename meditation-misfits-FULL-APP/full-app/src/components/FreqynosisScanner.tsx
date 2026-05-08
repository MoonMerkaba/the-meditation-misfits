import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const scanningMessages = [
  "Loading Source NRG…",
  "Decoding harmonic field…",
  "Tracing resonance echoes…",
  "Aligning soul signature…",
  "Extracting aura waveform…",
  "Tuning Misfitorian channel…",
  "Pulling dominant frequency thread…",
  "Calibrating resonance pathways…",
  "Forging Sound-icine prescription…"
];

const FreqynosisScanner: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);

  useEffect(() => {
    // Randomly select 4-6 messages for this scan
    const selectedMessages = scanningMessages
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 4);

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < selectedMessages.length) {
        setDisplayedMessages(prev => [...prev, selectedMessages[messageIndex]]);
        messageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-black/50 border-purple-500 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-spin border-t-transparent"></div>
            <div className="absolute inset-2 rounded-full border-2 border-pink-400 animate-spin border-b-transparent animation-delay-300"></div>
            <div className="absolute inset-4 rounded-full border border-blue-400 animate-spin border-l-transparent animation-delay-600"></div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-purple-300">Freqynosis in Progress</h2>
          
          <div className="space-y-2 min-h-[200px]">
            {displayedMessages.map((message, index) => (
              <div
                key={index}
                className="text-lg text-gray-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {message}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreqynosisScanner;
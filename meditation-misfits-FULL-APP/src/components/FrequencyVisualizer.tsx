import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FrequencyVisualizerProps {
  frequency?: number;
  isActive?: boolean;
}

const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({ 
  frequency = 432, 
  isActive = false 
}) => {
  const [waves, setWaves] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setWaves(prev => {
          const newWaves = [...prev];
          newWaves.push(Math.random() * 100);
          return newWaves.slice(-20); // Keep last 20 waves
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/30">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-cyan-400 font-bold text-lg">Frequency: {frequency} Hz</h3>
          <p className="text-white/70 text-sm">Consciousness Engineering in Progress</p>
        </div>
        
        {/* Visual wave representation */}
        <div className="h-24 flex items-end justify-center gap-1 bg-black/20 rounded-lg p-2">
          {waves.map((height, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-cyan-500 to-purple-500 rounded-sm transition-all duration-200"
              style={{
                height: `${height}%`,
                width: '4px',
                opacity: isActive ? 0.8 : 0.3
              }}
            />
          ))}
        </div>
        
        {/* Frequency info */}
        <div className="mt-4 text-center">
          <div className="flex justify-between text-xs text-white/60">
            <span>Binaural</span>
            <span>Solfeggio</span>
            <span>Isochronic</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrequencyVisualizer;
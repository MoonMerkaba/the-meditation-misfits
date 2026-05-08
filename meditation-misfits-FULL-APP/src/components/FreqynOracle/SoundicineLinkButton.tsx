import React from 'react';
import { Button } from '../ui/button';
import { Play, Waves } from 'lucide-react';

interface SoundicineLinkButtonProps {
  url: string;
  onPlay: (url: string) => void;
}

export const SoundicineLinkButton: React.FC<SoundicineLinkButtonProps> = ({ url, onPlay }) => {
  // Extract goal from URL if present
  const urlObj = new URL(url);
  const goal = urlObj.searchParams.get('goal') || 'frequency';
  const minutes = urlObj.searchParams.get('minutes') || '?';
  
  const displayGoal = goal.replace(/([A-Z])/g, ' $1').trim();
  const capitalizedGoal = displayGoal.charAt(0).toUpperCase() + displayGoal.slice(1);

  return (
    <Button
      onClick={() => onPlay(url)}
      className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
    >
      <Waves className="w-5 h-5 mr-2" />
      <span className="flex-1 text-left">
        Play Soundicine: {capitalizedGoal}
      </span>
      <span className="text-xs opacity-80 ml-2">{minutes} min</span>
      <Play className="w-4 h-4 ml-2" />
    </Button>
  );
};

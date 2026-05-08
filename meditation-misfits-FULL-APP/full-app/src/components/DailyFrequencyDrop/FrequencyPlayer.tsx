import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStreak } from '@/hooks/useStreak';
import { useToast } from '@/hooks/use-toast';

interface FrequencyPlayerProps {
  audioUrl: string;
  onPlay: () => void;
}


export function FrequencyPlayer({ audioUrl, onPlay }: FrequencyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { updateStreak } = useStreak();
  const { toast } = useToast();
  const hasUpdatedStreak = useRef(false);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
      onPlay();
      
      // Update streak on first play
      if (!hasUpdatedStreak.current) {
        hasUpdatedStreak.current = true;
        const result = await updateStreak();
        if (result?.today_marked && result.current_streak > 0) {
          toast({
            title: `Streak updated: Day ${result.current_streak}!`,
            description: result.rewards_granted?.length 
              ? `🎉 Milestone unlocked!` 
              : `Keep it up!`,
          });
        }
      }
    }
  };


  return (
    <div className="space-y-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <Button
        onClick={togglePlay}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="lg"
      >
        {isPlaying ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
        {isPlaying ? 'Pause Frequency' : 'Play Frequency'}
      </Button>

      {progress > 0 && (
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

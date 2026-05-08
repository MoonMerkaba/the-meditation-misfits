import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TrialCountdownProps {
  trialEndDate: string;
}

export const TrialCountdown = ({ trialEndDate }: TrialCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(trialEndDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Trial ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left in trial`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left in trial`);
      } else {
        setTimeLeft(`${minutes}m left in trial`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [trialEndDate]);

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-purple-400" />
        <div>
          <p className="text-sm font-medium text-purple-300">{timeLeft}</p>
          <p className="text-xs text-gray-400">Enjoy all premium features</p>
        </div>
      </div>
    </Card>
  );
};

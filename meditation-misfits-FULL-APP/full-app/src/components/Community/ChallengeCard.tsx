import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/lib/community';
import { Users, Target, Calendar, Trophy } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: string) => void;
  onLeave: (challengeId: string) => void;
}

export const ChallengeCard = ({ challenge, onJoin, onLeave }: ChallengeCardProps) => {
  const isActive = challenge.endDate ? new Date(challenge.endDate) > new Date() : true;
  const progress = challenge.userProgress || 0;
  const progressPercent = (progress / challenge.goalValue) * 100;

  const goalTypeLabels = {
    days_streak: 'Day Streak',
    total_sessions: 'Sessions',
    total_minutes: 'Minutes'
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-6 hover:border-purple-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
          </div>
          <p className="text-slate-400 text-sm mb-3">{challenge.description}</p>
        </div>
        {isActive && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Active
          </Badge>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Target className="w-4 h-4 text-purple-400" />
          <span>Goal: {challenge.goalValue} {goalTypeLabels[challenge.goalType]}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Users className="w-4 h-4 text-blue-400" />
          <span>{challenge.participantsCount} participants</span>
        </div>

        {challenge.endDate && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {challenge.isParticipating && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Your Progress</span>
            <span className="text-purple-400 font-semibold">{progress} / {challenge.goalValue}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      <Button
        onClick={() => challenge.isParticipating ? onLeave(challenge.id) : onJoin(challenge.id)}
        className={challenge.isParticipating 
          ? "w-full bg-slate-700 hover:bg-slate-600" 
          : "w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"}
      >
        {challenge.isParticipating ? 'Leave Challenge' : 'Join Challenge'}
      </Button>
    </Card>
  );
};
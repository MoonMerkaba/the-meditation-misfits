import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/lib/community';
import { UserPlus, UserMinus, Flame, Target } from 'lucide-react';

interface UserProfileCardProps {
  profile: UserProfile;
  isFollowing: boolean;
  isOwnProfile: boolean;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export const UserProfileCard = ({ 
  profile, 
  isFollowing, 
  isOwnProfile,
  onFollow, 
  onUnfollow,
  onViewProfile 
}: UserProfileCardProps) => {
  return (
    <Card className="bg-slate-900/50 border-slate-800 p-6 hover:bg-slate-900/70 transition-all cursor-pointer"
          onClick={() => onViewProfile(profile.userId)}>
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xl">
            {profile.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-white">{profile.displayName}</h3>
              <p className="text-slate-400 text-sm">@{profile.username}</p>
            </div>
            
            {!isOwnProfile && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  isFollowing ? onUnfollow(profile.userId) : onFollow(profile.userId);
                }}
                className={isFollowing 
                  ? "bg-slate-700 hover:bg-slate-600" 
                  : "bg-purple-600 hover:bg-purple-700"}
              >
                {isFollowing ? <UserMinus className="w-4 h-4 mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
          
          {profile.bio && (
            <p className="text-slate-300 text-sm mb-3">{profile.bio}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-400">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>{profile.meditationStreak} day streak</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Target className="w-4 h-4 text-blue-400" />
              <span>{profile.totalSessions} sessions</span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-slate-400">
              <span className="text-white font-semibold">{profile.followers}</span> followers
            </span>
            <span className="text-slate-400">
              <span className="text-white font-semibold">{profile.following}</span> following
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
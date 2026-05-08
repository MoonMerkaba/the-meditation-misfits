import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EditProfileModal } from './EditProfileModal';
import { PremiumBadge } from '../Premium/PremiumBadge';
import { TrialCountdown } from '../Premium/TrialCountdown';
import { EmailPreferences } from '../Notifications/EmailPreferences';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';

import { 
  User, Clock, Heart, Calendar, TrendingUp, Star, Users, MapPin, 
  Link as LinkIcon, Edit3, ArrowLeft, UserPlus, UserMinus, Trophy, MessageCircle, Crown, Eye
} from 'lucide-react';



interface UserProfilePageProps {
  userId: string;
  currentUserId: string;
  onBack: () => void;
  onSendMessage?: (userId: string, userName: string) => void;
}


export const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId, currentUserId, onBack, onSendMessage }) => {
  const { isPremium } = useSubscription();
  const [profile, setProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState<any>({ followerCount: 0, followingCount: 0, sharedReflections: [] });
  const [loading, setLoading] = useState(true);


  const isOwnProfile = userId === currentUserId;

  useEffect(() => {
    loadProfile();
  }, [userId, currentUserId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Load user profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setProfile(profileData || { 
        id: userId, 
        name: 'User', 
        username: `@user${userId.slice(0, 4)}`,
        bio: '',
        avatar_url: ''
      });

      // Get user stats
      const { data: statsData } = await supabase.functions.invoke('get-user-stats', {
        body: { userId, viewerId: currentUserId }
      });

      if (statsData) {
        setStats(statsData);
        setIsFollowing(statsData.isFollowing);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleFollow = async () => {
    try {
      const action = isFollowing ? 'unfollow' : 'follow';
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      await supabase.functions.invoke('follow-user', {
        body: { followingId: userId, action }
      });

      setIsFollowing(!isFollowing);
      
      // Update follower count
      setStats((prev: any) => ({
        ...prev,
        followerCount: isFollowing ? prev.followerCount - 1 : prev.followerCount + 1
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleSaveProfile = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (!error) {
        setProfile({ ...profile, ...updates });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading || !profile) return <div className="flex items-center justify-center min-h-screen"><div className="text-white">Loading...</div></div>;


  if (!profile) return null;

  // Get user's posts, challenges, and activity
  const posts = JSON.parse(localStorage.getItem('mm.community.posts') || '[]')
    .filter((p: any) => p.userId === userId);
  const challenges = JSON.parse(localStorage.getItem('mm.community.challenges') || '[]')
    .filter((c: any) => c.creatorId === userId || c.participants?.includes(userId));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card className="bg-gray-800/50 border-purple-500/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    {isOwnProfile && isPremium && <PremiumBadge variant="compact" />}
                  </div>
                  <p className="text-gray-400">{profile.username}</p>
                  {profile.bio && <p className="text-sm text-gray-300 mt-2 max-w-md">{profile.bio}</p>}

                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    {profile.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>
                    )}
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-purple-400">
                        <LinkIcon className="h-3 w-3" />{profile.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button onClick={() => setShowEditModal(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleFollow} variant={isFollowing ? 'outline' : 'default'}>
                      {isFollowing ? <UserMinus className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    {onSendMessage && (
                      <Button onClick={() => onSendMessage(userId, profile.name)} variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" /> Message
                      </Button>
                    )}
                  </>
                )}
              </div>

            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-4 gap-4 my-6">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-400" />
              <div className="text-xl font-bold">{profile.stats?.minutes || 0}</div>
              <div className="text-xs text-gray-400">Minutes</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
              <div className="text-xl font-bold">{profile.stats?.sessions || 0}</div>
              <div className="text-xs text-gray-400">Sessions</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-400" />
              <div className="text-xl font-bold">{stats.followerCount}</div>
              <div className="text-xs text-gray-400">Followers</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-pink-400" />
              <div className="text-xl font-bold">{stats.followingCount}</div>
              <div className="text-xs text-gray-400">Following</div>
            </CardContent>
          </Card>
        </div>



        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="reflections">Reflections ({stats.sharedReflections.length})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="challenges">Challenges ({challenges.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="email">Email Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="reflections" className="space-y-4 mt-4">
            {stats.sharedReflections.length > 0 ? stats.sharedReflections.map((shared: any) => (
              <Card key={shared.id} className="bg-gray-800/50 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge>{shared.session_reflections?.frequency_name || 'Reflection'}</Badge>
                    <div className="flex gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{shared.view_count}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{shared.resonance_count}</span>
                    </div>
                  </div>
                  <p className="text-gray-200">{shared.session_reflections?.reflection_text}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(shared.shared_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            )) : <p className="text-center text-gray-400 py-8">No shared reflections yet</p>}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.length > 0 ? posts.map((post: any) => (
              <Card key={post.id} className="bg-gray-800/50 border-purple-500/20">
                <CardContent className="p-4">
                  <Badge className="mb-2">{post.type}</Badge>
                  <p className="text-gray-200">{post.content}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-400">
                    <span>{post.likes || 0} likes</span>
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-center text-gray-400 py-8">No posts yet</p>}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4 mt-4">
            {challenges.length > 0 ? challenges.map((challenge: any) => (
              <Card key={challenge.id} className="bg-gray-800/50 border-purple-500/20">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{challenge.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{challenge.description}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <Badge>{challenge.participants?.length || 0} participants</Badge>
                    <span className="text-gray-400">Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-center text-gray-400 py-8">No challenges yet</p>}
          </TabsContent>

          <TabsContent value="activity" className="space-y-3 mt-4">
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <p className="text-gray-300 text-sm">Activity timeline coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="email" className="mt-4">
              <EmailPreferences />
            </TabsContent>
          )}

        </Tabs>

      </div>

      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentProfile={profile}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
};

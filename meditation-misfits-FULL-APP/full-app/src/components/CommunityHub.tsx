import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { PostCard } from './Community/PostCard';
import { CreatePostModal } from './Community/CreatePostModal';
import { CommentSection } from './Community/CommentSection';
import { ChallengeCard } from './Community/ChallengeCard';
import { CreateChallengeModal } from './Community/CreateChallengeModal';
import { UserProfileCard } from './Community/UserProfileCard';
import { SearchBar } from './Community/SearchBar';
import { UserProfilePage } from './Profile/UserProfilePage';
import { communityStorage, CommunityPost, Challenge, Comment, UserProfile } from '@/lib/community';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Users, Trophy, MessageSquare, Filter } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


export default function CommunityHub() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  
  // Filter states
  const [postTypeFilter, setPostTypeFilter] = useState<string>('all');
  const [challengeSortBy, setChallengeSortBy] = useState<string>('popularity');
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');


  if (viewingUserId && user) {
    return <UserProfilePage userId={viewingUserId} currentUserId={user.id} onBack={() => setViewingUserId(null)} 
      onSendMessage={(userId, userName) => {
        setViewingUserId(null);
        window.dispatchEvent(new CustomEvent('openMessages', { detail: { userId, userName } }));
      }} />;
  }



  useEffect(() => {
    if (user) {
      const profs = communityStorage.getProfiles();
      if (!profs.find(p => p.userId === user.id)) {
        const stats = JSON.parse(localStorage.getItem('mm.stats') || '{}');
        communityStorage.saveProfiles([...profs, {
          id: Date.now().toString(), userId: user.id, username: user.name.toLowerCase().replace(/\s/g, ''),
          displayName: user.name, bio: 'New meditation misfit 🧘', meditationStreak: stats.streak || 0,
          totalSessions: stats.totalSessions || 0, followers: 0, following: 0, createdAt: new Date().toISOString()
        }]);
      }
    }
    loadData();
  }, [user]);

  const loadData = () => {
    const allPosts = communityStorage.getPosts();
    const likes = communityStorage.getLikes();
    const participants = communityStorage.getParticipants();
    setPosts(allPosts.map(p => ({ ...p, likedByUser: likes.some(l => l.postId === p.id && l.userId === user?.id) }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setChallenges(communityStorage.getChallenges().map(c => ({
      ...c, isParticipating: participants.some(p => p.challengeId === c.id && p.userId === user?.id),
      userProgress: participants.find(p => p.challengeId === c.id && p.userId === user?.id)?.progress || 0
    })));
    setProfiles(communityStorage.getProfiles());
  };

  const handleCreatePost = (content: string, postType: string, isPublic: boolean) => {
    if (!user) return;
    communityStorage.savePosts([...communityStorage.getPosts(), {
      id: Date.now().toString(), userId: user.id, username: user.name.toLowerCase().replace(/\s/g, ''),
      displayName: user.name, content, postType: postType as any, isPublic, likesCount: 0, commentsCount: 0,
      createdAt: new Date().toISOString()
    }]);
    loadData();
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    const likes = communityStorage.getLikes();
    const existingLike = likes.find(l => l.postId === postId && l.userId === user.id);
    if (existingLike) {
      communityStorage.saveLikes(likes.filter(l => l.id !== existingLike.id));
    } else {
      communityStorage.saveLikes([...likes, { id: Date.now().toString(), postId, userId: user.id, createdAt: new Date().toISOString() }]);
    }
    communityStorage.savePosts(communityStorage.getPosts().map(p => 
      p.id === postId ? { ...p, likesCount: existingLike ? p.likesCount - 1 : p.likesCount + 1 } : p
    ));
    loadData();
  };

  const handleComment = (postId: string) => {
    setSelectedPost(postId);
    setComments(communityStorage.getComments().filter(c => c.postId === postId));
  };

  const handleAddComment = (content: string) => {
    if (!user || !selectedPost) return;
    communityStorage.saveComments([...communityStorage.getComments(), {
      id: Date.now().toString(), postId: selectedPost, userId: user.id,
      username: user.name.toLowerCase().replace(/\s/g, ''), displayName: user.name, content,
      createdAt: new Date().toISOString()
    }]);
    communityStorage.savePosts(communityStorage.getPosts().map(p => 
      p.id === selectedPost ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ));
    loadData();
    setComments(communityStorage.getComments().filter(c => c.postId === selectedPost));
  };

  const handleCreateChallenge = (data: any) => {
    if (!user) return;
    communityStorage.saveChallenges([...communityStorage.getChallenges(), {
      ...data, id: Date.now().toString(), creatorId: user.id, creatorName: user.name,
      participantsCount: 0, createdAt: new Date().toISOString()
    }]);
    loadData();
  };

  const handleJoinChallenge = (challengeId: string) => {
    if (!user) return;
    communityStorage.saveParticipants([...communityStorage.getParticipants(), { 
      id: Date.now().toString(), challengeId, userId: user.id, progress: 0, completed: false,
      joinedAt: new Date().toISOString() 
    }]);
    communityStorage.saveChallenges(communityStorage.getChallenges().map(c => 
      c.id === challengeId ? { ...c, participantsCount: c.participantsCount + 1 } : c
    ));
    loadData();
  };

  const handleFollow = (profileId: string) => {
    if (!user) return;
    const follows = communityStorage.getFollows();
    communityStorage.saveFollows([...follows, { 
      id: Date.now().toString(), followerId: user.id, followingId: profileId, createdAt: new Date().toISOString() 
    }]);
    loadData();
  };

  const handleUnfollow = (profileId: string) => {
    if (!user) return;
    communityStorage.saveFollows(communityStorage.getFollows().filter(
      f => !(f.followerId === user.id && f.followingId === profileId)
    ));
    loadData();
  };

  const isFollowing = (profileId: string) => {
    return communityStorage.getFollows().some(f => f.followerId === user?.id && f.followingId === profileId);
  };

  // Filter and sort functions
  const filteredPosts = posts.filter(post => {
    if (postTypeFilter === 'all') return true;
    return post.postType === postTypeFilter;
  });

  const sortedChallenges = [...challenges].sort((a, b) => {
    if (challengeSortBy === 'popularity') {
      return b.participantsCount - a.participantsCount;
    } else if (challengeSortBy === 'endDate') {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    return 0;
  });

  const filteredProfiles = profiles.filter(profile => {
    if (profile.userId === user?.id) return false;
    
    if (communityFilter === 'following') {
      if (!isFollowing(profile.id)) return false;
    }
    
    if (userSearchQuery) {
      const query = userSearchQuery.toLowerCase();
      return profile.displayName.toLowerCase().includes(query) || 
             profile.username.toLowerCase().includes(query);
    }
    
    return true;
  });


  return (
    <div className="min-h-screen p-6 pb-24" style={{ background: '#000000' }}>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-4">
            Community <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Hub</span>
          </h1>
          <p className="text-xl text-slate-400">Share your journey, connect with misfits</p>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="feed"><MessageSquare className="w-4 h-4 mr-2" />Feed</TabsTrigger>
            <TabsTrigger value="challenges"><Trophy className="w-4 h-4 mr-2" />Challenges</TabsTrigger>
            <TabsTrigger value="community"><Users className="w-4 h-4 mr-2" />Community</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <Button onClick={() => setShowCreatePost(true)} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />Share Your Experience
            </Button>
            
            <div className="flex items-center gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
              <Filter className="w-5 h-5 text-purple-400" />
              <Select value={postTypeFilter} onValueChange={setPostTypeFilter}>
                <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Posts</SelectItem>
                  <SelectItem value="experience" className="text-white">Experiences</SelectItem>
                  <SelectItem value="journal" className="text-white">Journal Entries</SelectItem>
                  <SelectItem value="milestone" className="text-white">Milestones</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-400">{filteredPosts.length} posts</span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No posts found. Be the first to share!</p>
              </div>
            ) : (
              filteredPosts.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} onUserClick={() => {}} />
              ))
            )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <Button onClick={() => setShowCreateChallenge(true)} className="w-full bg-gradient-to-r from-amber-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />Create Challenge
            </Button>
            
            <div className="flex items-center gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
              <Filter className="w-5 h-5 text-amber-400" />
              <Select value={challengeSortBy} onValueChange={setChallengeSortBy}>
                <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="popularity" className="text-white">Most Popular</SelectItem>
                  <SelectItem value="endDate" className="text-white">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-400">{sortedChallenges.length} challenges</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {sortedChallenges.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No challenges yet. Create one to get started!</p>
                </div>
              ) : (
                sortedChallenges.map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} onJoin={handleJoinChallenge} onLeave={() => {}} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <div className="space-y-4">
              <SearchBar 
                value={userSearchQuery} 
                onChange={setUserSearchQuery} 
                placeholder="Search users by name or username..." 
              />
              
              <div className="flex items-center gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                <Filter className="w-5 h-5 text-blue-400" />
                <Select value={communityFilter} onValueChange={setCommunityFilter}>
                  <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Filter users" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">All Users</SelectItem>
                    <SelectItem value="following" className="text-white">Following Only</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-400">{filteredProfiles.length} users</span>
              </div>
            </div>

            {filteredProfiles.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users found. Try adjusting your filters.</p>
              </div>
            ) : (
              filteredProfiles.map(profile => (
                <UserProfileCard key={profile.id} profile={profile} isFollowing={isFollowing(profile.id)}
                  isOwnProfile={profile.userId === user?.id} onFollow={() => handleFollow(profile.id)}
                  onUnfollow={() => handleUnfollow(profile.id)} onViewProfile={() => {}} />
              ))
            )}
          </TabsContent>
        </Tabs>

        <CreatePostModal open={showCreatePost} onClose={() => setShowCreatePost(false)} onSubmit={handleCreatePost} />
        <CreateChallengeModal open={showCreateChallenge} onClose={() => setShowCreateChallenge(false)} onSubmit={handleCreateChallenge} />
        
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
            <CommentSection comments={comments} onAddComment={handleAddComment} currentUserName={user?.name || ''} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

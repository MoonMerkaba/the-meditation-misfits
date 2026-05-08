import { communityStorage, CommunityPost, Challenge, Comment, UserProfile } from '@/lib/community';

export const ensureUserProfile = (user: any) => {
  if (!user) return;
  const profiles = communityStorage.getProfiles();
  if (!profiles.find(p => p.userId === user.id)) {
    const stats = JSON.parse(localStorage.getItem('mm.stats') || '{}');
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.name.toLowerCase().replace(/\s/g, ''),
      displayName: user.name,
      bio: 'New meditation misfit 🧘',
      meditationStreak: stats.streak || 0,
      totalSessions: stats.totalSessions || 0,
      followers: 0,
      following: 0,
      createdAt: new Date().toISOString()
    };
    communityStorage.saveProfiles([...profiles, newProfile]);
  }
};

export const loadCommunityData = (user: any) => {
  const allPosts = communityStorage.getPosts();
  const allChallenges = communityStorage.getChallenges();
  const allProfiles = communityStorage.getProfiles();
  const likes = communityStorage.getLikes();
  const participants = communityStorage.getParticipants();
  const follows = communityStorage.getFollows();
  
  return {
    posts: allPosts.map(p => ({
      ...p,
      likedByUser: likes.some(l => l.postId === p.id && l.userId === user?.id)
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    challenges: allChallenges.map(c => ({
      ...c,
      isParticipating: participants.some(p => p.challengeId === c.id && p.userId === user?.id),
      userProgress: participants.find(p => p.challengeId === c.id && p.userId === user?.id)?.progress || 0
    })),
    profiles: allProfiles,
    follows
  };
};

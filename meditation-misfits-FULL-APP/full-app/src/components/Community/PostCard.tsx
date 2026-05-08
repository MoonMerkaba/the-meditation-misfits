import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { CommunityPost } from '@/lib/community';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: CommunityPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export const PostCard = ({ post, onLike, onComment, onUserClick }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.likedByUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike(post.id);
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const typeColors = {
    experience: 'bg-purple-500/20 text-purple-300',
    journal: 'bg-blue-500/20 text-blue-300',
    milestone: 'bg-amber-500/20 text-amber-300'
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-6 hover:bg-slate-900/70 transition-all">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 cursor-pointer" onClick={() => onUserClick(post.userId)}>
          <AvatarImage src={post.avatarUrl} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
            {post.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white cursor-pointer hover:text-purple-400" 
                  onClick={() => onUserClick(post.userId)}>
              {post.displayName}
            </span>
            <span className="text-slate-500 text-sm">@{post.username}</span>
            <Badge className={typeColors[post.postType]}>{post.postType}</Badge>
            <span className="text-slate-500 text-sm ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeAgo(post.createdAt)}
            </span>
          </div>
          
          <p className="text-slate-300 mb-4 whitespace-pre-wrap">{post.content}</p>
          
          {post.sessionData && (
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4 text-sm">
              <div className="text-slate-400">
                Session: {post.sessionData.duration} • {post.sessionData.frequencies?.join(', ')}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLike}
                    className={isLiked ? 'text-pink-500' : 'text-slate-400'}>
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onComment(post.id)} className="text-slate-400">
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.commentsCount}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/lib/community';
import { Send } from 'lucide-react';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onUserClick: (userId: string) => void;
  currentUserName: string;
  currentUserAvatar?: string;
}


export const CommentSection = ({ comments, onAddComment, onUserClick, currentUserName, currentUserAvatar }: CommentSectionProps) => {

  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 bg-slate-800/30 rounded-lg p-3">
            <Avatar className="w-8 h-8 cursor-pointer" onClick={() => onUserClick(comment.userId)}>
              <AvatarImage src={comment.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xs">
                {comment.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white text-sm cursor-pointer hover:text-purple-400" 
                      onClick={() => onUserClick(comment.userId)}>
                  {comment.displayName}
                </span>
                <span className="text-slate-500 text-xs">{getTimeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-slate-300 text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      
      <div className="flex gap-3 items-start">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUserAvatar} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xs">
            {currentUserName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="bg-slate-800 border-slate-700 text-white text-sm min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button onClick={handleSubmit} size="sm" disabled={!newComment.trim()}
                  className="bg-purple-600 hover:bg-purple-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageCircle, Flag, MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { username: string; avatar_url: string };
  like_count: number;
  is_liked: boolean;
  replies: Comment[];
}

interface CommentSectionProps {
  collectionId: string;
  isOwner: boolean;
}

export function CommentSection({ collectionId, isOwner }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportDialog, setReportDialog] = useState<{ open: boolean; commentId: string | null }>({
    open: false,
    commentId: null,
  });
  const [reportReason, setReportReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [collectionId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('list-comments', {
        body: { collection_id: collectionId },
      });
      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (parentId?: string) => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('post-comment', {
        body: {
          collection_id: collectionId,
          content: newComment,
          parent_id: parentId,
        },
      });
      if (error) throw error;
      setNewComment('');
      setReplyTo(null);
      await loadComments();
      toast({ title: 'Comment posted successfully' });
    } catch (error: any) {
      toast({ title: 'Error posting comment', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('toggle-comment-like', {
        body: { comment_id: commentId },
      });
      if (error) throw error;
      await loadComments();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleReport = async () => {
    if (!reportDialog.commentId || !reportReason.trim()) return;
    try {
      const { error } = await supabase.functions.invoke('report-comment', {
        body: { comment_id: reportDialog.commentId, reason: reportReason },
      });
      if (error) throw error;
      toast({ title: 'Comment reported', description: 'Thank you for helping keep our community safe' });
      setReportDialog({ open: false, commentId: null });
      setReportReason('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={depth > 0 ? 'ml-8 mt-4' : 'mt-4'}>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profiles?.avatar_url} />
            <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm">{comment.profiles?.username}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setReportDialog({ open: true, commentId: comment.id })}>
                    <Flag className="h-4 w-4 mr-2" /> Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm mt-2">{comment.content}</p>
            <div className="flex items-center gap-4 mt-3">
              <Button variant="ghost" size="sm" onClick={() => handleLike(comment.id)}>
                <ThumbsUp className={`h-4 w-4 mr-1 ${comment.is_liked ? 'fill-current' : ''}`} />
                {comment.like_count}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment.id)}>
                <MessageCircle className="h-4 w-4 mr-1" /> Reply
              </Button>
            </div>
            {replyTo === comment.id && (
              <div className="mt-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSubmit(comment.id)} disabled={loading}>Post Reply</Button>
                  <Button size="sm" variant="outline" onClick={() => { setReplyTo(null); setNewComment(''); }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      <Card className="p-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="mb-2"
        />
        <Button onClick={() => handleSubmit()} disabled={loading}>Post Comment</Button>
      </Card>
      {comments.map((comment) => renderComment(comment))}
      <AlertDialog open={reportDialog.open} onOpenChange={(open) => setReportDialog({ ...reportDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Comment</AlertDialogTitle>
            <AlertDialogDescription>Please explain why this comment should be reviewed.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Reason for reporting..." />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReportReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport}>Submit Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

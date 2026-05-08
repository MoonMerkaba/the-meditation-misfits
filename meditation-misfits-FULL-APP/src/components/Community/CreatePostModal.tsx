import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string, postType: string, isPublic: boolean) => void;
}

export const CreatePostModal = ({ open, onClose, onSubmit }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'experience' | 'journal' | 'milestone'>('experience');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content, postType, isPublic);
    setContent('');
    setPostType('experience');
    setIsPublic(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Share Your Journey
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Post Type</Label>
            <Select value={postType} onValueChange={(v: any) => setPostType(v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="experience">Meditation Experience</SelectItem>
                <SelectItem value="journal">Journal Entry</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-slate-300 mb-2 block">Your Story</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your meditation experience, insights, or journey..."
              className="bg-slate-800 border-slate-700 text-white min-h-[150px]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-slate-300">Make Public</Label>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} className="border-slate-700">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
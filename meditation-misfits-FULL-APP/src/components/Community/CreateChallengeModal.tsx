import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateChallengeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreateChallengeModal = ({ open, onClose, onSubmit }: CreateChallengeModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<'days_streak' | 'total_sessions' | 'total_minutes'>('days_streak');
  const [goalValue, setGoalValue] = useState('7');
  const [duration, setDuration] = useState('30');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration));
    
    onSubmit({
      title,
      description,
      goalType,
      goalValue: parseInt(goalValue),
      endDate: endDate.toISOString()
    });
    
    setTitle('');
    setDescription('');
    setGoalType('days_streak');
    setGoalValue('7');
    setDuration('30');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
            Create Challenge
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Challenge Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 7-Day Meditation Streak"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          
          <div>
            <Label className="text-slate-300 mb-2 block">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the challenge and what participants should aim for..."
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Goal Type</Label>
              <Select value={goalType} onValueChange={(v: any) => setGoalType(v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="days_streak">Days Streak</SelectItem>
                  <SelectItem value="total_sessions">Total Sessions</SelectItem>
                  <SelectItem value="total_minutes">Total Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">Goal Value</Label>
              <Input
                type="number"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-slate-300 mb-2 block">Duration (days)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} className="border-slate-700">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || !description.trim()}
                    className="bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700">
              Create Challenge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
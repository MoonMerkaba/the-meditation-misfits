import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CancelSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, feedback: string) => void;
  loading?: boolean;
}

export const CancelSubscriptionModal = ({ open, onOpenChange, onConfirm, loading }: CancelSubscriptionModalProps) => {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const reasons = [
    'Too expensive',
    'Not using it enough',
    'Found a better alternative',
    'Technical issues',
    'Other'
  ];

  const handleSubmit = () => {
    onConfirm(reason, feedback);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Cancel Subscription</DialogTitle>
          <p className="text-gray-400 mt-2">We're sorry to see you go. Please let us know why you're canceling.</p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white mb-3 block">Reason for canceling</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reasons.map((r) => (
                <div key={r} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="text-gray-300 cursor-pointer">{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="feedback" className="text-white">Additional feedback (optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="bg-gray-800 border-gray-700 text-white mt-2"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Keep Subscription
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Canceling...' : 'Cancel Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

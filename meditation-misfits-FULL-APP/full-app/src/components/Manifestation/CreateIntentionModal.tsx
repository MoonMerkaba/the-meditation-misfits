import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateGallery } from './TemplateGallery';
import { Sparkles } from 'lucide-react';

interface CreateIntentionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}


export function CreateIntentionModal({ open, onClose, onCreated }: CreateIntentionModalProps) {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('abundance');
  const [northStar, setNorthStar] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);


  const handleTemplateSelect = (template: any) => {
    setTitle(template.title);
    setArea(template.area.toLowerCase().replace(/\s+/g, '_'));
    setNorthStar(template.north_star);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // API call handled by parent
    onCreated();
    onClose();
    setLoading(false);
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Intention</DialogTitle>
          </DialogHeader>
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 border-purple-200 hover:bg-purple-50"
            onClick={() => setShowTemplates(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Area</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abundance">Abundance</SelectItem>
                  <SelectItem value="love">Love</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="purpose">Purpose</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>North Star (one sentence)</Label>
              <Textarea value={northStar} onChange={(e) => setNorthStar(e.target.value)} required />
            </div>
            <div>
              <Label>Deadline (optional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">Create Intention</Button>
          </form>
        </DialogContent>
      </Dialog>
      <TemplateGallery
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </>
  );
}

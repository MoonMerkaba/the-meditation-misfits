import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, category: string, isPublic: boolean) => Promise<void>;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Focus');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(name, category, isPublic);
      setName('');
      setCategory('Focus');
      setIsPublic(false);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-white">Save Preset</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-purple-200">Preset Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Focus Mix" className="bg-purple-800/30 border-purple-500/30 text-white" />
          </div>
          <div>
            <Label className="text-purple-200">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-purple-800/30 border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Focus">Focus</SelectItem>
                <SelectItem value="Relaxation">Relaxation</SelectItem>
                <SelectItem value="Healing">Healing</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-purple-200">Share with Community</Label>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <Button onClick={handleSave} disabled={!name.trim() || saving} className="w-full">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Preset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { storage } from '../lib/storage';

interface JournalModalProps {
  sessionKey: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JournalModal({ sessionKey, isOpen, onClose }: JournalModalProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (sessionKey) {
      const saved = storage.get(`mm.journal.${sessionKey}`);
      setText(saved || '');
    }
  }, [sessionKey]);

  const handleSave = () => {
    if (sessionKey) {
      storage.set(`mm.journal.${sessionKey}`, text);
      onClose();
    }
  };

  const handleClear = () => {
    setText('');
    if (sessionKey) {
      storage.remove(`mm.journal.${sessionKey}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Journal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Reflect on your experience..."
            rows={8}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={handleClear} variant="outline">Clear</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

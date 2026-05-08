import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, SkipBack, X } from 'lucide-react';
import { GeneratedMeditationPlayer } from '../CustomMeditation/GeneratedMeditationPlayer';

interface CollectionPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meditations: any[];
  collectionName: string;
}

export function CollectionPlayer({ open, onOpenChange, meditations, collectionName }: CollectionPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const currentMeditation = meditations[currentIndex]?.custom_meditations;
  const progress = ((currentIndex + 1) / meditations.length) * 100;

  const handleNext = () => {
    if (currentIndex < meditations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (autoPlay) {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    if (autoPlay && currentIndex < meditations.length - 1) {
      setTimeout(() => handleNext(), 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{collectionName}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} of {meditations.length}
          </div>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        {currentMeditation && (
          <GeneratedMeditationPlayer
            meditation={currentMeditation}
            onComplete={handleComplete}
          />
        )}

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === meditations.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
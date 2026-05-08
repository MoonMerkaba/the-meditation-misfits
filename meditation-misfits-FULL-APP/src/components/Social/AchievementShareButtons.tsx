import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Share2 } from 'lucide-react';
import { AchievementCardGenerator } from './AchievementCardGenerator';
import { toast } from 'sonner';

interface AchievementShareButtonsProps {
  streakCount: number;
  milestoneName?: string;
  totalQuests: number;
  longestStreak: number;
  badgeEmoji?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AchievementShareButtons({ 
  streakCount,
  milestoneName,
  totalQuests,
  longestStreak,
  badgeEmoji,
  variant = 'outline',
  size = 'sm'
}: AchievementShareButtonsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleImageGenerated = (dataUrl: string) => {
    setImageUrl(dataUrl);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `meditation-misfits-achievement-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    toast.success('Achievement card downloaded!');
  };

  const shareToTwitter = () => {
    const text = `I just hit a ${streakCount} day streak on Meditation Misfits! ${milestoneName ? `Unlocked: ${milestoneName}! ` : ''}Join me on this journey of daily quests and transformation. 🌟`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setShowDialog(true)}>
        <Share2 className="w-4 h-4 mr-2" />
        Share Achievement
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
          </DialogHeader>
          
          <AchievementCardGenerator 
            streakCount={streakCount}
            milestoneName={milestoneName}
            totalQuests={totalQuests}
            longestStreak={longestStreak}
            badgeEmoji={badgeEmoji}
            onGenerated={handleImageGenerated}
          />
          
          {imageUrl && (
            <div className="space-y-4">
              <img src={imageUrl} alt="Achievement card" className="w-full rounded-lg shadow-lg" />
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={shareToTwitter} className="bg-[#1DA1F2] hover:bg-[#1a8cd8]">
                  Twitter
                </Button>
                <Button onClick={shareToFacebook} className="bg-[#4267B2] hover:bg-[#365899] col-span-2">
                  Facebook
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Download and share to Instagram Stories or Feed
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

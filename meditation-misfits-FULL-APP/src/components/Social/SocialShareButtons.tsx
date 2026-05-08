import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Share2 } from 'lucide-react';
import { QuoteCardGenerator } from './QuoteCardGenerator';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  text: string;
  type: 'win' | 'reflection';
}

export function SocialShareButtons({ text, type }: SocialShareButtonsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleImageGenerated = (dataUrl: string) => {
    setImageUrl(dataUrl);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `meditation-misfits-${type}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    toast.success('Image downloaded!');
  };

  const shareToTwitter = () => {
    const text = `Check out my manifestation journey on Meditation Misfits! 🌟`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowDialog(true)}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Your {type === 'win' ? 'Win' : 'Reflection'}</DialogTitle>
          </DialogHeader>
          
          <QuoteCardGenerator text={text} type={type} onGenerated={handleImageGenerated} />
          
          {imageUrl && (
            <div className="space-y-4">
              <img src={imageUrl} alt="Quote card" className="w-full rounded-lg shadow-lg" />
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={shareToTwitter} className="bg-[#1DA1F2]">
                  Share to Twitter
                </Button>
                <Button onClick={shareToFacebook} className="bg-[#4267B2] col-span-2">
                  Share to Facebook
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Download the image and share to Instagram
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

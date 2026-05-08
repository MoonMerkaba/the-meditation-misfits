import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressImage, generateUniqueFileName } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';

interface CrystalPhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  crystalName?: string;
}

export function CrystalPhotoUpload({ currentPhotoUrl, onPhotoUploaded, crystalName }: CrystalPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 10MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      // Compress the image
      const compressedBlob = await compressImage(file, 800, 0.8);
      
      // Generate unique filename
      const fileName = generateUniqueFileName(file.name);
      const filePath = `crystals/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('crystal-photos')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        // If bucket doesn't exist, try uploading to a general bucket
        console.error('Upload error:', error);
        
        // Try uploading to avatars bucket as fallback
        const { data: fallbackData, error: fallbackError } = await supabase.storage
          .from('avatars')
          .upload(`crystal_${fileName}`, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (fallbackError) {
          throw new Error('Failed to upload image. Please try again.');
        }

        // Get public URL from fallback bucket
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(`crystal_${fileName}`);

        onPhotoUploaded(urlData.publicUrl);
        toast({ title: 'Photo uploaded', description: 'Your crystal photo has been saved.' });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('crystal-photos')
        .getPublicUrl(filePath);

      onPhotoUploaded(urlData.publicUrl);
      toast({ title: 'Photo uploaded', description: 'Your crystal photo has been saved.' });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Upload failed', 
        description: error.message || 'Failed to upload photo. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    onPhotoUploaded('');
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-3">
      {/* Current Photo Display */}
      {currentPhotoUrl && (
        <div className="relative group">
          <img
            src={currentPhotoUrl}
            alt={crystalName || 'Crystal'}
            className="w-full h-48 object-cover rounded-lg border border-purple-500/30 cursor-pointer"
            onClick={() => {
              setPreviewUrl(currentPhotoUrl);
              setShowPreview(true);
            }}
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemovePhoto}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
            Click to view full size
          </div>
        </div>
      )}

      {/* Upload Buttons */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {currentPhotoUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isUploading}
          className="border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>

      {/* Photo Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-purple-200 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {crystalName || 'Crystal Photo'}
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt={crystalName || 'Crystal'}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

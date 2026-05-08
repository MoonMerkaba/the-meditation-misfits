import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FileUploadButtonProps {
  conversationId: string;
  onFileSelect: (file: File, url: string, fileName: string) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
};

export function FileUploadButton({ conversationId, onFileSelect, disabled }: FileUploadButtonProps) {
  const [uploading, setUploading] = useState(false);

  const validateFileType = (file: File): boolean => {
    return Object.keys(ALLOWED_TYPES).includes(file.type);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    if (!validateFileType(file)) {
      toast.error('Invalid file type. Allowed: JPG, PNG, GIF, PDF, DOCX, TXT');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${user.id}/${conversationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create signed URL for private bucket (valid for 1 hour)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(filePath, 3600);

      if (urlError) throw urlError;

      onFileSelect(file, signedUrlData.signedUrl, file.name);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.txt"
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || uploading}
          className="cursor-pointer"
          asChild
        >
          <span>
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </span>
        </Button>
      </label>
    </>
  );
}

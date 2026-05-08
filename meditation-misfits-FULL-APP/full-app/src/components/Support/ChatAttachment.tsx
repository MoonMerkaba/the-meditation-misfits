import { FileText, FileImage, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatAttachmentProps {
  url: string;
  name: string;
  type?: string;
}

export function ChatAttachment({ url, name, type }: ChatAttachmentProps) {
  const isImage = type?.startsWith('image/') || /\.(jpg|jpeg|png|gif)$/i.test(name);
  const isPdf = type === 'application/pdf' || name.endsWith('.pdf');
  const isDoc = name.endsWith('.docx') || name.endsWith('.txt');

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isImage) {
    return (
      <div className="mt-2 space-y-2">
        <img 
          src={url} 
          alt={name}
          className="max-w-full rounded-lg border border-border max-h-48 object-contain"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="w-full text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          {name}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 p-2 bg-background/50 rounded border border-border">
      {isPdf ? (
        <FileText className="h-4 w-4 text-red-500" />
      ) : isDoc ? (
        <FileText className="h-4 w-4 text-blue-500" />
      ) : (
        <FileImage className="h-4 w-4 text-gray-500" />
      )}
      <span className="flex-1 text-xs truncate">{name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleDownload}
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
}

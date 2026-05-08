import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TranscriptExportProps {
  conversationId: string;
}

export default function TranscriptExport({ conversationId }: TranscriptExportProps) {
  const [format, setFormat] = useState<'pdf' | 'txt' | 'csv'>('pdf');
  const [loading, setLoading] = useState(false);

  const exportTranscript = async () => {
    setLoading(true);
    try {
      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select('*, chat_messages(*), chat_ratings(*), profiles!user_id(*)')
        .eq('id', conversationId)
        .single();

      if (!conversation) throw new Error('Conversation not found');

      const messages = conversation.chat_messages || [];
      const rating = conversation.chat_ratings?.[0];
      
      let content = '';
      const metadata = `
Freqyn Support - Chat Transcript
================================
Date: ${new Date(conversation.created_at).toLocaleString()}
Customer: ${conversation.user_name} (${conversation.user_email})
Duration: ${calculateDuration(conversation.created_at, conversation.updated_at)}
Status: ${conversation.status}
${rating ? `Satisfaction Rating: ${rating.rating}/5` : ''}
${rating?.feedback ? `Feedback: ${rating.feedback}` : ''}
================================

`;

      if (format === 'txt') {
        content = metadata + messages.map(m => 
          `[${new Date(m.created_at).toLocaleTimeString()}] ${m.sender_type}: ${m.message}`
        ).join('\n');
      } else if (format === 'csv') {
        content = 'Timestamp,Sender,Message\n' + messages.map(m =>
          `"${new Date(m.created_at).toLocaleString()}","${m.sender_type}","${m.message.replace(/"/g, '""')}"`
        ).join('\n');
      } else if (format === 'pdf') {
        // For PDF, we'll create HTML that can be printed to PDF
        content = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
    .message { margin: 15px 0; padding: 10px; border-left: 3px solid #ddd; }
    .user { border-left-color: #4CAF50; }
    .agent { border-left-color: #2196F3; }
    .timestamp { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Freqyn Support - Chat Transcript</h1>
    <p><strong>Date:</strong> ${new Date(conversation.created_at).toLocaleString()}</p>
    <p><strong>Customer:</strong> ${conversation.user_name} (${conversation.user_email})</p>
    ${rating ? `<p><strong>Rating:</strong> ${rating.rating}/5 ${rating.feedback ? `- ${rating.feedback}` : ''}</p>` : ''}
  </div>
  ${messages.map(m => `
    <div class="message ${m.sender_type}">
      <div class="timestamp">${new Date(m.created_at).toLocaleString()} - ${m.sender_type}</div>
      <div>${m.message}</div>
    </div>
  `).join('')}
</body>
</html>`;
      }

      const blob = new Blob([content], { type: format === 'pdf' ? 'text/html' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transcript-${conversationId}.${format === 'pdf' ? 'html' : format}`;
      link.click();
      
      toast.success(`Transcript exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export transcript');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minutes`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Transcript</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF (Printable)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    Text File
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    CSV (Spreadsheet)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportTranscript} disabled={loading} className="w-full">
            {loading ? 'Exporting...' : 'Download Transcript'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
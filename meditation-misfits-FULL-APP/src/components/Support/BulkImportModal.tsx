import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function BulkImportModal({ open, onOpenChange, onImportComplete }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [autoCategorizе, setAutoCategorizе] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a CSV file');
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const entries = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const entry: any = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      entries.push(entry);
    }
    
    return entries;
  };

  const categorizeWithAI = async (question: string, answer: string): Promise<string> => {
    try {
      const { data } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: `Categorize this Q&A into one word: Q: ${question} A: ${answer}`,
          isTest: true
        }
      });
      return data?.response?.trim() || 'General';
    } catch {
      return 'General';
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const entries = parseCSV(text);
      const { data: { user } } = await supabase.auth.getUser();

      let successCount = 0;
      for (const entry of entries) {
        const category = autoCategorizе 
          ? await categorizeWithAI(entry.question, entry.answer)
          : entry.category || 'General';

        const { error } = await supabase.from('ai_knowledge_base').insert({
          question: entry.question,
          answer: entry.answer,
          category,
          tags: entry.tags ? entry.tags.split(';').map((t: string) => t.trim()) : [],
          quality_score: parseInt(entry.quality_score) || 5,
          created_by: user?.id
        });

        if (!error) {
          successCount++;
          // Generate embedding
          await supabase.functions.invoke('generate-embeddings', {
            body: { text: `${entry.question} ${entry.answer}` }
          });
        }
      }

      toast.success(`Imported ${successCount} of ${entries.length} entries`);
      onImportComplete();
      onOpenChange(false);
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Knowledge Base</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload CSV with columns: question, answer, category, tags, quality_score
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="max-w-xs mx-auto"
            />
            {file && <p className="text-sm mt-2 text-green-600">Selected: {file.name}</p>}
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoCategorizе}
              onChange={(e) => setAutoCategorizе(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-categorize with AI</span>
          </label>

          <Button onClick={handleImport} disabled={!file || importing} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TemplateCard } from './TemplateCard';
import { AITemplateGenerator } from './AITemplateGenerator';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';


interface TemplateGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

export function TemplateGallery({ open, onClose, onSelectTemplate }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);


  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('intention_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template: any) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleAITemplateGenerated = (template: any) => {
    onSelectTemplate(template);
    setShowAIGenerator(false);
    onClose();
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {showAIGenerator ? 'AI Template Generator' : 'Choose Your Intention Template'}
              </DialogTitle>
              <p className="text-gray-600">
                {showAIGenerator 
                  ? 'Describe your goal and AI will create a personalized template' 
                  : 'Select a pre-made template or generate one with AI'}
              </p>
            </div>
            {showAIGenerator && (
              <Button variant="ghost" onClick={() => setShowAIGenerator(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </DialogHeader>

        {showAIGenerator ? (
          <AITemplateGenerator
            onTemplateGenerated={handleAITemplateGenerated}
            onClose={() => setShowAIGenerator(false)}
          />
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Button
                onClick={() => setShowAIGenerator(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Custom Template with AI
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Send, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AITemplateGeneratorProps {
  onTemplateGenerated: (template: any) => void;
  onClose: () => void;
}

export function AITemplateGenerator({ onTemplateGenerated, onClose }: AITemplateGeneratorProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);

  const generateTemplate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-intention-template', {
        body: { goalDescription: input, conversationHistory }
      });

      if (error) throw error;

      setTemplate(data.template);
      setConversationHistory(data.conversationHistory);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've created a personalized intention template for you! Review it below and let me know if you'd like to refine anything.` 
      }]);
      setInput('');
    } catch (error) {
      console.error('Error generating template:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const refineTemplate = async () => {
    if (!input.trim() || !template) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {
      const refinementPrompt = `Based on this template: ${JSON.stringify(template)}\n\nUser wants to refine: ${input}\n\nGenerate an updated template.`;
      
      const { data, error } = await supabase.functions.invoke('generate-intention-template', {
        body: { goalDescription: refinementPrompt, conversationHistory }
      });

      if (error) throw error;

      setTemplate(data.template);
      setConversationHistory(data.conversationHistory);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'ve updated your template based on your feedback!' 
      }]);
      setInput('');
    } catch (error) {
      console.error('Error refining template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (template) {
      refineTemplate();
    } else {
      generateTemplate();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gradient-to-b from-purple-50 to-white">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Intention Generator</h3>
            <p className="text-gray-600">Describe your goal and I'll create a personalized intention template for you.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white border border-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {template && (
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <h4 className="font-semibold text-lg mb-2">{template.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="space-y-2 text-sm">
              <div><strong>North Star:</strong> {template.northStar}</div>
              <div><strong>Actions:</strong> {template.suggestedActions?.length || 0} suggested</div>
              <div><strong>Example Wins:</strong> {template.exampleWins?.length || 0} milestones</div>
            </div>
          </Card>
        )}
      </div>

      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={template ? "How would you like to refine this template?" : "Describe your goal... (e.g., 'I want to start a successful online business')"}
            className="flex-1 min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button onClick={handleSubmit} disabled={loading || !input.trim()} size="icon">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            {template && (
              <Button onClick={() => onTemplateGenerated(template)} variant="default" size="icon" className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
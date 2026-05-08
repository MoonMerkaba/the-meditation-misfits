import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2, Send, Moon } from 'lucide-react';
import { toast } from 'sonner';

export function ShadowMessenger() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await invokeEdgeFunction('shadow-messenger', { user_id: user.id, action: 'history' });
      if (data) {
        setMessages(Array.isArray(data) ? data.reverse() : []);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const userMsg = input;
    setInput('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('shadow-messenger', { user_id: user.id, message: userMsg });
      if (!error && data) {
        setMessages([...messages, data]);
      } else {
        toast.error(error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900/40 to-purple-900/20 border-purple-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Moon className="w-5 h-5 text-purple-400" />
        <h3 className="text-xl font-bold text-purple-300">Shadow Self Messenger</h3>
      </div>
      
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="space-y-2">
            <div className="bg-blue-900/30 p-3 rounded-lg ml-8">
              <p className="text-sm text-gray-300">{msg.user_message}</p>
            </div>
            <div className="bg-purple-900/30 p-3 rounded-lg mr-8">
              <p className="text-sm text-gray-300">{msg.shadow_response}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your Shadow Self..."
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </Card>
  );
}

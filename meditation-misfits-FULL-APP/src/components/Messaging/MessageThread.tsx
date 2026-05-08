import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/community';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Share2, Trophy } from 'lucide-react';
import { Card } from '../ui/card';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  receiverName: string;
  onSendMessage: (content: string, type: 'text' | 'session_share' | 'challenge_invite', metadata?: any) => void;
}

export function MessageThread({ messages, currentUserId, receiverName, onSendMessage }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), 'text');
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${msg.senderId === currentUserId ? 'bg-purple-600' : 'bg-slate-700'} rounded-2xl p-3`}>
              <p className="text-xs text-slate-300 mb-1">{msg.senderName}</p>
              {msg.messageType === 'text' && <p className="text-white">{msg.content}</p>}
              {msg.messageType === 'session_share' && (
                <Card className="bg-slate-800 border-slate-600 p-3">
                  <Share2 className="w-4 h-4 text-blue-400 mb-2" />
                  <p className="text-sm text-white">{msg.content}</p>
                </Card>
              )}
              {msg.messageType === 'challenge_invite' && (
                <Card className="bg-slate-800 border-slate-600 p-3">
                  <Trophy className="w-4 h-4 text-amber-400 mb-2" />
                  <p className="text-sm text-white">{msg.content}</p>
                </Card>
              )}
              <p className="text-xs text-slate-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${receiverName}...`} className="bg-slate-800 border-slate-700 text-white resize-none"
            rows={2} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} />
          <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Ticket, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import TranscriptExport from './TranscriptExport';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  sender_name: string;
  sender_type: 'user' | 'agent' | 'system';
  message: string;
  created_at: string;
}

interface AgentChatViewProps {
  conversationId: string;
  onClose: () => void;
}

export default function AgentChatView({ conversationId, onClose }: AgentChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`agent-chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data } = await supabase.functions.invoke('get-chat-messages', {
        body: { conversationId }
      });
      setMessages(data?.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await supabase.functions.invoke('send-chat-message', {
        body: {
          conversationId,
          senderId: user?.id,
          senderName: 'Support Agent',
          senderType: 'agent',
          message: newMessage
        }
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!ticketSubject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setLoading(true);
    try {
      await supabase.functions.invoke('create-ticket-from-chat', {
        body: {
          conversationId,
          userId: user?.id,
          subject: ticketSubject,
          priority: ticketPriority
        }
      });
      toast.success('Ticket created successfully');
      setShowTicketDialog(false);
      setTicketSubject('');
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center rounded-t-lg">
          <h3 className="font-semibold">Chat Conversation</h3>
          <div className="flex gap-2">
            <TranscriptExport conversationId={conversationId} />
            <Button variant="ghost" size="sm" onClick={() => setShowTicketDialog(true)}>
              <Ticket className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender_type === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <p className="text-xs font-semibold mb-1">{msg.sender_name}</p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t space-y-2">
          <Textarea
            placeholder="Type your response..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="min-h-[80px]"
          />
          <Button onClick={sendMessage} disabled={loading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Response
          </Button>
        </div>
      </Card>

      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Enter ticket subject"
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={ticketPriority} onValueChange={setTicketPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createTicket} disabled={loading}>
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
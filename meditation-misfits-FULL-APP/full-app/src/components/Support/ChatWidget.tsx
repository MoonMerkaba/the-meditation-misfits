import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { FileUploadButton } from './FileUploadButton';
import { RatingModal } from './RatingModal';
import { ChatAttachment } from './ChatAttachment';


interface Message {
  id: string;
  sender_name: string;
  sender_type: 'user' | 'agent' | 'system' | 'bot';
  message: string;
  attachment_url?: string;
  attachment_name?: string;
  created_at: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [conversationStatus, setConversationStatus] = useState('waiting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
        filter: `id=eq.${conversationId}`
      }, (payload) => {
        const newStatus = (payload.new as any).status;
        setConversationStatus(newStatus);
        if (newStatus === 'closed') {
          setShowRating(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const startChat = async () => {
    if (!userName || !userEmail) {
      toast.error('Please enter your name and email');
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('start-chat-conversation', {
        body: { userName, userEmail, userId: user?.id }
      });

      setConversationId(data.conversation.id);
      setIsStarted(true);
      toast.success('Chat started!');
    } catch (error) {
      toast.error('Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    setLoading(true);
    try {
      await supabase.functions.invoke('send-chat-message', {
        body: {
          conversationId,
          senderId: user?.id,
          senderName: userName,
          senderType: 'user',
          message: newMessage,
          attachmentUrl,
          attachmentName
        }
      });

      setNewMessage('');
      setAttachmentUrl(null);
      setAttachmentName(null);

      const { data: aiData } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: newMessage,
          conversationHistory: messages,
          userId: user?.id
        }
      });

      if (aiData?.response) {
        await supabase.functions.invoke('send-chat-message', {
          body: {
            conversationId,
            senderName: 'AI Assistant',
            senderType: 'bot',
            message: aiData.response
          }
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File, url: string) => {
    setAttachmentUrl(url);
    setAttachmentName(file.name);
    toast.success('File attached');
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col shadow-2xl z-50">
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center rounded-t-lg">
            <h3 className="font-semibold">Live Support</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!isStarted ? (
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Start a conversation</p>
              <Input placeholder="Your name" value={userName} onChange={(e) => setUserName(e.target.value)} />
              <Input type="email" placeholder="Your email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
              <Button onClick={startChat} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Chat'}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender_type === 'user' ? 'bg-primary text-primary-foreground' : 
                      msg.sender_type === 'bot' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'
                    }`}>
                      <p className="text-xs font-semibold mb-1">{msg.sender_name}</p>
                      <p className="text-sm">{msg.message}</p>
                      {msg.attachment_url && (
                        <ChatAttachment 
                          url={msg.attachment_url} 
                          name={msg.attachment_name || 'Attachment'} 
                        />
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3"><p className="text-sm">Agent is typing...</p></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>


              <div className="p-4 border-t space-y-2">
                {attachmentName && (
                  <div className="flex items-center gap-2 text-xs bg-muted p-2 rounded">
                    <FileText className="h-3 w-3" />
                    <span className="flex-1 truncate">{attachmentName}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" 
                            onClick={() => { setAttachmentUrl(null); setAttachmentName(null); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  {conversationId && (
                    <FileUploadButton 
                      conversationId={conversationId}
                      onFileSelect={handleFileSelect} 
                      disabled={loading} 
                    />
                  )}
                  <Button onClick={sendMessage} disabled={loading} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />Send
                  </Button>

                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {conversationId && (
        <RatingModal
          isOpen={showRating}
          onClose={() => setShowRating(false)}
          conversationId={conversationId}
        />
      )}
    </>
  );
}
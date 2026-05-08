import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AgentChatView from './AgentChatView';
import NotificationSettings from './NotificationSettings';

interface Conversation {
  id: string;
  user_name: string;
  user_email: string;
  status: 'active' | 'waiting' | 'closed';
  created_at: string;
  last_message_at: string;
  assigned_agent_id?: string;
}

export default function AgentDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('waiting');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    requestNotificationPermission();
    setupRealtimeNotifications();
  }, []);


  useEffect(() => {
    loadConversations();
    
    const channel = supabase
      .channel('agent-conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_conversations'
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const setupRealtimeNotifications = () => {
    const channel = supabase
      .channel('agent-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        showNotification(payload.new);
        playSound();
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const showNotification = (message: any) => {
    const prefs = JSON.parse(localStorage.getItem('agentNotificationPrefs') || '{}');
    if (!prefs.newMessage || prefs.dndEnabled) return;

    if (Notification.permission === 'granted') {
      new Notification('New Message', {
        body: message.message,
        icon: '/icon.png',
        badge: '/badge.png'
      });
    }
  };

  const playSound = () => {
    const prefs = JSON.parse(localStorage.getItem('agentNotificationPrefs') || '{}');
    if (!prefs.soundEnabled) return;

    const audio = new Audio(`/sounds/${prefs.soundType || 'chime'}.mp3`);
    audio.play().catch(() => {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      oscillator.connect(context.destination);
      oscillator.frequency.value = 800;
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    });
  };

  const loadConversations = async () => {
    try {
      const { data } = await supabase.functions.invoke('get-agent-conversations', {
        body: { 
          agentId: activeTab === 'mine' ? user?.id : null,
          status: activeTab === 'closed' ? 'closed' : activeTab === 'waiting' ? 'waiting' : 'active'
        }
      });

      setConversations(data?.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };


  const assignToMe = async (convId: string) => {
    try {
      await supabase.functions.invoke('assign-conversation', {
        body: { conversationId: convId, agentId: user?.id }
      });
      toast.success('Conversation assigned to you');
      loadConversations();
    } catch (error) {
      toast.error('Failed to assign conversation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="h-4 w-4" />;
      case 'active': return <MessageSquare className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Agent Dashboard</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-6 px-2">
              {unreadCount}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6">
          <NotificationSettings />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="waiting">Waiting</TabsTrigger>
                <TabsTrigger value="mine">My Chats</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No conversations
                  </p>
                ) : (
                  conversations.map((conv) => (
                    <Card
                      key={conv.id}
                      className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                        selectedConv === conv.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedConv(conv.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{conv.user_name}</p>
                          <p className="text-xs text-muted-foreground">{conv.user_email}</p>
                        </div>
                        <Badge variant={conv.status === 'waiting' ? 'destructive' : 'default'}>
                          {getStatusIcon(conv.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.last_message_at).toLocaleString()}
                      </p>
                      {conv.status === 'waiting' && (
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            assignToMe(conv.id);
                          }}
                        >
                          Assign to Me
                        </Button>
                      )}
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedConv ? (
            <AgentChatView conversationId={selectedConv} onClose={() => setSelectedConv(null)} />
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
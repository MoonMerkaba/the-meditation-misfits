import { useState, useEffect } from 'react';
import { communityStorage, Conversation, Message } from '@/lib/community';
import { useAuth } from '@/contexts/AuthContext';
import { MessageThread } from './MessageThread';
import { GroupMessageThread } from './GroupMessageThread';
import { CreateGroupModal } from './CreateGroupModal';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, MessageCircle, Search, Users } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface MessagingInterfaceProps {
  onBack: () => void;
  initialReceiverId?: string;
  initialReceiverName?: string;
}

export function MessagingInterface({ onBack, initialReceiverId, initialReceiverName }: MessagingInterfaceProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);


  useEffect(() => {
    if (user) {
      loadConversations();
      if (initialReceiverId && initialReceiverName) {
        startConversation(initialReceiverId, initialReceiverName);
      }
    }
  }, [user, initialReceiverId]);

  const loadConversations = () => {
    const allConvos = communityStorage.getConversations();
    const userConvos = allConvos.filter(c => 
      c.isGroup 
        ? c.participants?.includes(user?.id || '')
        : c.participant1Id === user?.id || c.participant2Id === user?.id
    );
    const allMessages = communityStorage.getMessages();
    
    const convosWithUnread = userConvos.map(c => {
      const convoMessages = allMessages.filter(m => m.conversationId === c.id);
      const unreadCount = convoMessages.filter(m => m.receiverId === user?.id && !m.read).length;
      return { ...c, unreadCount };
    });
    
    setConversations(convosWithUnread.sort((a, b) => 
      new Date(b.lastMessageAt || b.id).getTime() - new Date(a.lastMessageAt || a.id).getTime()
    ));
  };


  const startConversation = (receiverId: string, receiverName: string) => {
    const allConvos = communityStorage.getConversations();
    let convo = allConvos.find(c => 
      !c.isGroup && (
        (c.participant1Id === user?.id && c.participant2Id === receiverId) ||
        (c.participant2Id === user?.id && c.participant1Id === receiverId)
      )
    );
    
    if (!convo) {
      convo = {
        id: Date.now().toString(),
        isGroup: false,
        participant1Id: user!.id,
        participant1Name: user!.name,
        participant2Id: receiverId,
        participant2Name: receiverName
      };
      communityStorage.saveConversations([...allConvos, convo]);
    }
    
    setSelectedConversation(convo);
    loadMessages(convo.id);
  };

  const handleGroupCreated = (groupId: string) => {
    loadConversations();
    const allConvos = communityStorage.getConversations();
    const group = allConvos.find(c => c.id === groupId);
    if (group) {
      setSelectedConversation(group);
      loadMessages(group.id);
    }
  };


  const loadMessages = (conversationId: string) => {
    const allMessages = communityStorage.getMessages();
    const convoMessages = allMessages.filter(m => m.conversationId === conversationId);
    
    const updatedMessages = allMessages.map(m => 
      m.conversationId === conversationId && m.receiverId === user?.id ? { ...m, read: true } : m
    );
    communityStorage.saveMessages(updatedMessages);
    
    setMessages(convoMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    loadConversations();
  };

  const handleSendMessage = (content: string, type: 'text' | 'session_share' | 'challenge_invite', metadata?: any) => {
    if (!user || !selectedConversation) return;
    
    const receiverId = selectedConversation.participant1Id === user.id 
      ? selectedConversation.participant2Id 
      : selectedConversation.participant1Id;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      senderId: user.id,
      senderName: user.name,
      receiverId,
      content,
      messageType: type,
      metadata,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const allMessages = communityStorage.getMessages();
    communityStorage.saveMessages([...allMessages, newMessage]);
    
    const allConvos = communityStorage.getConversations();
    communityStorage.saveConversations(allConvos.map(c => 
      c.id === selectedConversation.id ? { ...c, lastMessage: content, lastMessageAt: newMessage.createdAt } : c
    ));
    
    loadMessages(selectedConversation.id);
    loadConversations();
  };

  const filteredConversations = conversations.filter(c => {
    if (c.isGroup) {
      return c.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    const otherName = c.participant1Id === user?.id ? c.participant2Name : c.participant1Name;
    return otherName.toLowerCase().includes(searchQuery.toLowerCase());
  });


  const getOtherParticipant = (convo: Conversation) => {
    return convo.participant1Id === user?.id 
      ? { id: convo.participant2Id, name: convo.participant2Name }
      : { id: convo.participant1Id, name: convo.participant1Name };
  };

  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto max-w-6xl h-screen flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center gap-3">
            <Button variant="ghost" onClick={() => setSelectedConversation(null)} className="text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold text-white">
              {selectedConversation.isGroup ? selectedConversation.groupName : getOtherParticipant(selectedConversation).name}
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            {selectedConversation.isGroup ? (
              <GroupMessageThread 
                messages={messages} 
                currentUserId={user!.id} 
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
                onUpdateGroup={() => {
                  loadConversations();
                  const allConvos = communityStorage.getConversations();
                  const updated = allConvos.find(c => c.id === selectedConversation.id);
                  if (updated) setSelectedConversation(updated);
                }}
              />
            ) : (
              <MessageThread 
                messages={messages} 
                currentUserId={user!.id} 
                receiverName={getOtherParticipant(selectedConversation).name} 
                onSendMessage={handleSendMessage} 
              />
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 pb-24">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-black text-white">Messages</h1>
          </div>
          <Button onClick={() => setShowCreateGroup(true)} className="bg-purple-600 hover:bg-purple-700">
            <Users className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..." className="pl-10 bg-slate-800 border-slate-700 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          {filteredConversations.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-500" />
              <p className="text-slate-400">No conversations yet. Start chatting with community members!</p>
            </Card>
          ) : (
            filteredConversations.map(convo => {
              const displayName = convo.isGroup ? convo.groupName : getOtherParticipant(convo).name;
              return (
                <Card key={convo.id} onClick={() => { setSelectedConversation(convo); loadMessages(convo.id); }}
                  className="bg-slate-800/50 border-slate-700 p-4 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {convo.isGroup && <Users className="w-5 h-5 text-purple-400" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{displayName}</h3>
                          {convo.unreadCount! > 0 && <Badge className="bg-purple-600">{convo.unreadCount}</Badge>}
                        </div>
                        {convo.lastMessage && <p className="text-sm text-slate-400 truncate">{convo.lastMessage}</p>}
                      </div>
                    </div>
                    {convo.lastMessageAt && (
                      <p className="text-xs text-slate-500">{new Date(convo.lastMessageAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
        <CreateGroupModal open={showCreateGroup} onClose={() => setShowCreateGroup(false)} onGroupCreated={handleGroupCreated} />
      </div>
    </div>
  );
}

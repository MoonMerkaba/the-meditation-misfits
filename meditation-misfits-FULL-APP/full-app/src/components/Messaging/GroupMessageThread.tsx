import { useState, useEffect, useRef } from 'react';
import { Message, Conversation, communityStorage } from '@/lib/community';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Share2, Trophy, Users, Settings, UserPlus, UserMinus } from 'lucide-react';
import { Card } from '../ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

interface GroupMessageThreadProps {
  messages: Message[];
  currentUserId: string;
  conversation: Conversation;
  onSendMessage: (content: string, type: 'text' | 'session_share' | 'challenge_invite', metadata?: any) => void;
  onUpdateGroup: () => void;
}

export function GroupMessageThread({ messages, currentUserId, conversation, onSendMessage, onUpdateGroup }: GroupMessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(conversation.groupName || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), 'text');
      setNewMessage('');
      setShowMentions(false);
    }
  };

  const handleMessageChange = (text: string) => {
    setNewMessage(text);
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
      setShowMentions(true);
      setMentionQuery('');
    } else if (lastAtIndex !== -1) {
      const query = text.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setShowMentions(true);
        setMentionQuery(query);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const lastAtIndex = newMessage.lastIndexOf('@');
    const beforeAt = newMessage.slice(0, lastAtIndex);
    setNewMessage(beforeAt + '@' + name + ' ');
    setShowMentions(false);
  };

  const members = conversation.participants || [];
  const memberNames = conversation.participantNames || {};
  const filteredMembers = members.filter(id => 
    memberNames[id]?.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleUpdateGroupName = () => {
    if (!newGroupName.trim()) return;
    const allConvos = communityStorage.getConversations();
    communityStorage.saveConversations(allConvos.map(c => 
      c.id === conversation.id ? { ...c, groupName: newGroupName } : c
    ));
    setEditingName(false);
    onUpdateGroup();
  };

  const handleRemoveMember = (userId: string) => {
    const updatedParticipants = members.filter(id => id !== userId);
    const updatedNames = { ...memberNames };
    delete updatedNames[userId];
    
    const allConvos = communityStorage.getConversations();
    communityStorage.saveConversations(allConvos.map(c => 
      c.id === conversation.id ? { ...c, participants: updatedParticipants, participantNames: updatedNames } : c
    ));
    onUpdateGroup();
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
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
          {showMentions && (
            <Card className="mb-2 bg-slate-800 border-slate-700 p-2 max-h-32 overflow-y-auto">
              {filteredMembers.map(id => (
                <Button key={id} variant="ghost" onClick={() => insertMention(memberNames[id])}
                  className="w-full justify-start text-white hover:bg-slate-700">
                  @{memberNames[id]}
                </Button>
              ))}
            </Card>
          )}
          <div className="flex gap-2">
            <Textarea value={newMessage} onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Type @ to mention someone..." className="bg-slate-800 border-slate-700 text-white resize-none"
              rows={2} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} />
            <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="m-2 text-white">
            <Users className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="bg-slate-800 border-slate-700 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">Group Info</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              {editingName ? (
                <div className="flex gap-2">
                  <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    className="bg-slate-700 border-slate-600" />
                  <Button onClick={handleUpdateGroupName} size="sm">Save</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{conversation.groupName}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditingName(true)}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Members ({members.length})</h4>
              <div className="space-y-2">
                {members.map(id => (
                  <div key={id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <span>{memberNames[id]}</span>
                    {conversation.createdBy === currentUserId && id !== currentUserId && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(id)}>
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

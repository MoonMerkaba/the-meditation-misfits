import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { communityStorage, UserProfile } from '@/lib/community';
import { useAuth } from '@/contexts/AuthContext';
import { Users } from 'lucide-react';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
}

export function CreateGroupModal({ open, onClose, onGroupCreated }: CreateGroupModalProps) {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const profiles = communityStorage.getProfiles().filter(p => p.userId !== user?.id);
  const filteredProfiles = profiles.filter(p => 
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!user || !groupName.trim() || selectedUsers.length === 0) return;

    const participants = [user.id, ...selectedUsers];
    const participantNames: { [key: string]: string } = { [user.id]: user.name };
    
    selectedUsers.forEach(userId => {
      const profile = profiles.find(p => p.userId === userId);
      if (profile) participantNames[userId] = profile.displayName;
    });

    const newGroup = {
      id: Date.now().toString(),
      isGroup: true,
      groupName,
      groupAvatar: '👥',
      participant1Id: user.id,
      participant1Name: user.name,
      participant2Id: selectedUsers[0],
      participant2Name: participantNames[selectedUsers[0]],
      participants,
      participantNames,
      createdBy: user.id
    };

    const allConvos = communityStorage.getConversations();
    communityStorage.saveConversations([...allConvos, newGroup]);
    
    onGroupCreated(newGroup.id);
    setGroupName('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..." className="bg-slate-700 border-slate-600" />
          </div>
          <div>
            <Label>Add Members</Label>
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..." className="bg-slate-700 border-slate-600 mb-2" />
            <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-700 rounded-lg p-2">
              {filteredProfiles.map(profile => (
                <div key={profile.userId} className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded">
                  <Checkbox checked={selectedUsers.includes(profile.userId)}
                    onCheckedChange={(checked) => {
                      setSelectedUsers(checked 
                        ? [...selectedUsers, profile.userId]
                        : selectedUsers.filter(id => id !== profile.userId)
                      );
                    }} />
                  <span>{profile.displayName}</span>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!groupName.trim() || selectedUsers.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700">
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

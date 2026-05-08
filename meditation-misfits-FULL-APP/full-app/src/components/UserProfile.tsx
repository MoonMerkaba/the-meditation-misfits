import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import CommunityHub from './CommunityHub';
import { ConstantContactSettings } from './Admin/ConstantContactSettings';
import { EmailTemplateManager } from './Admin/EmailTemplateManager';
import { SubscriptionManagement } from './Subscription/SubscriptionManagement';
import { MyJournalPage } from './MyJournal/MyJournalPage';



import { verificationStorage } from '../lib/storage';
import { sendVerificationEmail } from '../lib/verification';


import { 
  User, 
  Clock, 
  Heart, 
  Trash2, 
  Play, 
  Calendar,
  TrendingUp,
  Star,
  Users,
  Edit3,
  BarChart3,
  CheckCircle,
  Mail,
  AlertCircle
} from 'lucide-react';

interface UserProfileProps {
  onPlayStack: (stack: any) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onPlayStack }) => {
  const { user, sessions, favoriteStacks, deleteFavoriteStack, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [resendStatus, setResendStatus] = useState('');
  
  const verificationData = verificationStorage.get();
  const isVerified = verificationData?.verified || false;
  const userEmail = user?.email || verificationData?.email || '';

  const handleResendVerification = async () => {
    if (!userEmail) {
      setResendStatus('No email found');
      return;
    }
    
    setResendStatus('Sending...');
    const result = await sendVerificationEmail(userEmail);
    
    if (result.success) {
      setResendStatus('Verification email sent! Check your inbox.');
    } else {
      setResendStatus('Failed to send. Try again.');
    }
    
    setTimeout(() => setResendStatus(''), 5000);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please log in to view your profile</p>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalMinutes = sessions.reduce((acc, session) => {
    const minutes = parseInt(session.duration.replace('m', ''));
    return acc + (session.completed ? minutes : 0);
  }, 0);

  const frequencyStats = sessions.reduce((acc, session) => {
    session.frequencies.forEach(freq => {
      acc[freq] = (acc[freq] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const mostUsedFrequency = Object.entries(frequencyStats)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  const recentSessions = sessions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{user.name}</CardTitle>
                  {isVerified ? (
                    <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{userEmail}</p>
                {!isVerified && userEmail && (
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResendVerification}
                      className="text-xs flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      Resend Verification
                    </Button>
                    {resendStatus && (
                      <span className="text-xs text-gray-400">{resendStatus}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>


      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="favorites">My Stacks</TabsTrigger>
          <TabsTrigger value="journal">My Journal</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>




        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{totalMinutes}</div>
                <div className="text-sm text-gray-500">Minutes Meditated</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{completedSessions}</div>
                <div className="text-sm text-gray-500">Sessions Completed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{favoriteStacks.length}</div>
                <div className="text-sm text-gray-500">Favorite Stacks</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {session.type === 'simple' ? session.aim : 'Custom Stack'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(session.timestamp)} • {session.duration}
                        </div>
                      </div>
                      <Badge variant={session.completed ? 'default' : 'secondary'}>
                        {session.completed ? 'Completed' : 'Started'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No sessions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {session.type === 'simple' ? session.aim : 'Custom Stack'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            {formatDate(session.timestamp)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Duration: {session.duration} • Frequencies: {session.frequencies.join(', ')}
                          </div>
                        </div>
                        <Badge variant={session.completed ? 'default' : 'secondary'}>
                          {session.completed ? 'Completed' : 'Started'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No sessions recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Saved Stacks</CardTitle>
                <Badge variant="secondary">{favoriteStacks.length} stacks</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {favoriteStacks.length > 0 ? (
                <div className="grid gap-4">
                  {favoriteStacks.map((stack, index) => (
                    <div key={stack.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium flex items-center mb-2">
                            <Star className="h-4 w-4 mr-2 text-yellow-500" />
                            {stack.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Main:</span> {stack.mainLayer} ({Math.round(stack.mainVolume * 100)}%)
                            {stack.supportLayer !== 'none' && (
                              <> • <span className="font-medium">Support:</span> {stack.supportLayer} ({Math.round(stack.supportVolume * 100)}%)</>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {stack.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              Used 3 times
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onPlayStack(stack)}
                            className="flex items-center bg-gradient-to-r from-[#FF00BF] to-[#6683a0] hover:from-[#FF00BF]/90 hover:to-[#6683a0]/90"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteFavoriteStack(stack.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">No saved stacks yet</p>
                  <p className="text-sm text-gray-400">Create custom frequency combinations and save them for quick access</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="journal">
          <MyJournalPage />
        </TabsContent>
        
        <TabsContent value="subscription">
          <SubscriptionManagement />
        </TabsContent>
        
        <TabsContent value="community">
          <CommunityHub onClose={() => setActiveTab('overview')} />
        </TabsContent>




        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Sessions:</span>
                  <span className="font-medium">{totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate:</span>
                  <span className="font-medium">
                    {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Most Used Frequency:</span>
                  <span className="font-medium">{mostUsedFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Session:</span>
                  <span className="font-medium">
                    {totalSessions > 0 ? Math.round(totalMinutes / completedSessions) || 0 : 0} min
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frequency Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(frequencyStats).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(frequencyStats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([freq, count]) => (
                        <div key={freq} className="flex justify-between items-center">
                          <span className="capitalize">{freq}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${(count / Math.max(...Object.values(frequencyStats))) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No frequency data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Tabs defaultValue="constant-contact">
            <TabsList>
              <TabsTrigger value="constant-contact">Constant Contact</TabsTrigger>
              <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="constant-contact">
              <ConstantContactSettings />
            </TabsContent>
            <TabsContent value="email-templates">
              <EmailTemplateManager />
            </TabsContent>
          </Tabs>
        </TabsContent>


      </Tabs>
    </div>
  );
};
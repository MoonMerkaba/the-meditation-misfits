import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ReportReviewPanel } from './ReportReviewPanel';
import { ModerationHistory } from './ModerationHistory';
import { UserManagementPanel } from './UserManagementPanel';
import { Shield, AlertTriangle, History, Users } from 'lucide-react';

export function ModerationDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkAdminStatus();
    fetchPendingCount();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: role } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(!!role);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    const { count } = await supabase
      .from('comment_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    setPendingCount(count || 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Shield className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Moderation Dashboard</h1>
        <p className="text-gray-600">Review reports and manage community content</p>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports" className="relative">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reports
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ReportReviewPanel onActionTaken={fetchPendingCount} />
        </TabsContent>

        <TabsContent value="history">
          <ModerationHistory />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AlertTriangle, Ban, CheckCircle } from 'lucide-react';

export function UserManagementPanel() {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [warningsRes, bansRes] = await Promise.all([
        supabase.from('user_warnings').select('*, user:profiles(username)').order('created_at', { ascending: false }),
        supabase.from('user_bans').select('*, user:profiles(username)').eq('unbanned_at', null).order('created_at', { ascending: false })
      ]);

      setWarnings(warningsRes.data || []);
      setBans(bansRes.data || []);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (banId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_bans')
        .update({
          unbanned_at: new Date().toISOString(),
          unbanned_by: user.id
        })
        .eq('id', banId);

      if (error) throw error;
      toast.success('User unbanned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Tabs defaultValue="warnings">
      <TabsList>
        <TabsTrigger value="warnings">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Warnings ({warnings.length})
        </TabsTrigger>
        <TabsTrigger value="bans">
          <Ban className="w-4 h-4 mr-2" />
          Active Bans ({bans.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="warnings" className="space-y-4">
        {warnings.map((warning) => (
          <Card key={warning.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{warning.user?.username || 'Unknown User'}</h3>
                <p className="text-sm text-gray-600 mt-1">{warning.reason}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={warning.severity === 'high' ? 'destructive' : 'secondary'}>
                    {warning.severity}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(warning.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {warnings.length === 0 && (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No active warnings</p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bans" className="space-y-4">
        {bans.map((ban) => (
          <Card key={ban.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{ban.user?.username || 'Unknown User'}</h3>
                <p className="text-sm text-gray-600 mt-1">{ban.reason}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="destructive">
                    {ban.is_permanent ? 'Permanent' : `Until ${new Date(ban.banned_until).toLocaleDateString()}`}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Banned {new Date(ban.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleUnban(ban.id)}>
                Unban
              </Button>
            </div>
          </Card>
        ))}
        {bans.length === 0 && (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No active bans</p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
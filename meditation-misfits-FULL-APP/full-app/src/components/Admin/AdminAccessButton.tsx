import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, Key, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function AdminAccessButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: role } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(!!role);
      setAdminRole(role?.role || null);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-purple-600/20 border-purple-500 hover:bg-purple-600/30"
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Administration</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/admin/moderation')}>
          <Shield className="w-4 h-4 mr-2" />
          Moderation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/security')}>
          <ShieldAlert className="w-4 h-4 mr-2" />
          Security Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Support</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate('/admin/agent-dashboard')}>
          <Shield className="w-4 h-4 mr-2" />
          Support Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/support-analytics')}>
          <Shield className="w-4 h-4 mr-2" />
          Support Analytics
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/ai-training')}>
          <Shield className="w-4 h-4 mr-2" />
          AI Training
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Email Integration</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate('/admin/constant-contact')}>
          <Mail className="w-4 h-4 mr-2" />
          Email Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/oauth-test')}>
          <Key className="w-4 h-4 mr-2" />
          OAuth Testing
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

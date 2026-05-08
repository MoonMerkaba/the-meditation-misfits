import { StackDiscovery } from '@/components/StackCommunity/StackDiscovery';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function StackCommunityPage() {
  const navigate = useNavigate();

  const handleLoadStack = (config: any) => {
    sessionStorage.setItem('loadStackConfig', JSON.stringify(config));
    toast.success('Stack loaded! Opening mixer...');
    navigate('/');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('loadStackConfig', { detail: config }));
    }, 500);
  };

  return (
    <div className="min-h-screen pt-8" style={{ background: '#000000' }}>

      <div className="container mx-auto px-4 py-8">
        <StackDiscovery onLoadStack={handleLoadStack} />
      </div>
    </div>
  );
}

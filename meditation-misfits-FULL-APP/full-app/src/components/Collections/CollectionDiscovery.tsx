import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, Star, Clock, Users } from 'lucide-react';
import { PublicCollectionCard } from './PublicCollectionCard';
import { toast } from 'sonner';

interface Collection {
  id: string;
  name: string;
  description: string;
  theme: string;
  total_duration: number;
  clone_count: number;
  view_count: number;
  average_rating: number;
  rating_count: number;
  created_at: string;
  creator: {
    username: string;
    avatar_url: string;
  };
}

export function CollectionDiscovery() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  useEffect(() => {
    loadCollections();
  }, [theme, sortBy]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('browse-public-collections', {
        body: { theme: theme === 'all' ? null : theme, sortBy, limit: 50 }
      });

      if (error) throw error;
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Themes</SelectItem>
            <SelectItem value="sleep">Sleep</SelectItem>
            <SelectItem value="focus">Focus</SelectItem>
            <SelectItem value="anxiety">Anxiety Relief</SelectItem>
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="healing">Healing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="popular">Most Cloned</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading collections...</div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No collections found
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCollections.map((collection) => (
            <PublicCollectionCard key={collection.id} collection={collection} onClone={loadCollections} />
          ))}
        </div>
      )}
    </div>
  );
}
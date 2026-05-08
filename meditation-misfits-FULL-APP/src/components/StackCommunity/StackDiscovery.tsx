import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Star, Clock, Eye } from 'lucide-react';
import { StackCard } from './StackCard';
import { StackLeaderboard } from './StackLeaderboard';
import { supabase } from '@/lib/supabase';

export function StackDiscovery({ onLoadStack }: { onLoadStack?: (config: any) => void }) {
  const [stacks, setStacks] = useState<any[]>([]);
  const [filteredStacks, setFilteredStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('trending');

  useEffect(() => {
    loadStacks(sortBy);
  }, [sortBy]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredStacks(
        stacks.filter(s => 
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredStacks(stacks);
    }
  }, [searchQuery, stacks]);

  const loadStacks = async (sort: string) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('get-trending-stacks', {
      body: { sortBy: sort }
    });
    if (!error && data) {
      setStacks(data.stacks || []);
      setFilteredStacks(data.stacks || []);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stack Community</h1>
          <p className="text-muted-foreground">Discover and share frequency combinations</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={sortBy} onValueChange={setSortBy}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="top_rated" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Top Rated
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="most_viewed" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Most Viewed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {loading ? (
            <div className="text-center py-12">Loading stacks...</div>
          ) : filteredStacks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No stacks found</div>
          ) : (
            <div className="grid gap-4">
              {filteredStacks.map((stack) => (
                <StackCard
                  key={stack.id}
                  stack={stack}
                  onLoad={onLoadStack}
                  onClone={() => loadStacks(sortBy)}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <StackLeaderboard />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeedReflectionCard } from './FeedReflectionCard';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const FollowingFeed: React.FC<{ onBack: () => void; onProfileClick: (userId: string) => void }> = ({ onBack, onProfileClick }) => {
  const { user } = useAuth();
  const [view, setView] = useState<'following' | 'discover'>('following');
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadReflections = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);

    try {
      const currentPage = reset ? 0 : page;
      const limit = 10;
      const offset = currentPage * limit;

      if (view === 'following') {
        const { data, error } = await supabase.functions.invoke('get-following-feed', {
          body: { limit, offset, frequencyType: filter !== 'all' ? filter : undefined }
        });
        if (error) throw error;
        
        if (reset) {
          setReflections(data.reflections || []);
        } else {
          setReflections(prev => [...prev, ...(data.reflections || [])]);
        }
        setHasMore((data.reflections || []).length === limit);
      } else {
        const { data, error } = await supabase.functions.invoke('community-reflections', {
          body: { limit, offset, frequencyType: filter !== 'all' ? filter : undefined }
        });
        if (error) throw error;
        
        if (reset) {
          setReflections(data.reflections || []);
        } else {
          setReflections(prev => [...prev, ...(data.reflections || [])]);
        }
        setHasMore((data.reflections || []).length === limit);
      }

      setPage(reset ? 1 : currentPage + 1);
    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setReflections([]);
    setPage(0);
    setHasMore(true);
    loadReflections(true);
  }, [view, filter]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadReflections();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-indigo-900/20 pb-24 pt-20">
      <div className="max-w-3xl mx-auto px-4">
        <Button onClick={onBack} variant="ghost" className="mb-4">← Back</Button>
        
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Community Feed
        </h1>

        <div className="flex gap-4 mb-6 flex-wrap">
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="following"><Users className="w-4 h-4 mr-2" />Following</TabsTrigger>
              <TabsTrigger value="discover"><Globe className="w-4 h-4 mr-2" />Discover</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="528hz">528 Hz</SelectItem>
              <SelectItem value="432hz">432 Hz</SelectItem>
              <SelectItem value="639hz">639 Hz</SelectItem>
              <SelectItem value="741hz">741 Hz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {reflections.map((reflection) => (
            <FeedReflectionCard
              key={reflection.id}
              reflection={reflection}
              onProfileClick={onProfileClick}
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        <div ref={loadMoreRef} className="h-20" />

        {!hasMore && reflections.length > 0 && (
          <p className="text-center text-gray-400 py-8">No more reflections to load</p>
        )}

        {!loading && reflections.length === 0 && (
          <Card className="p-8 text-center bg-purple-900/20">
            <p className="text-gray-400">
              {view === 'following' 
                ? 'Follow users to see their reflections here' 
                : 'No public reflections yet'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

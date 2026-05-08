import { useState } from 'react';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { useToast } from '@/hooks/use-toast';

export interface Reflection {
  id: string;
  created_at: string;
  date: string;
  frequency_name: string;
  hz_value: number;
  text: string;
}

export function useReflections() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveReflection = async (data: {
    frequency_id: string;
    frequency_name: string;
    hz_value: number;
    text: string;
  }) => {
    setLoading(true);
    try {
      const { data: result, error } = await invokeEdgeFunction('save-reflection', data);

      if (error) {
        toast({
          title: 'Unable to save',
          description: error,
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Reflection saved',
        description: 'Your insight has been captured.',
      });

      return result?.id || null;
    } catch (err: any) {
      toast({
        title: 'Unable to save',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listReflections = async (params?: { limit?: number; offset?: number }) => {
    setLoading(true);
    try {
      const body: Record<string, any> = {};
      if (params?.limit) body.limit = params.limit;
      if (params?.offset) body.offset = params.offset;

      const { data: result, error } = await invokeEdgeFunction('list-reflections', 
        Object.keys(body).length > 0 ? body : undefined
      );

      if (error) {
        toast({
          title: 'Unable to load reflections',
          description: error,
          variant: 'destructive',
        });
        return [];
      }

      return (result?.items || result?.reflections || []) as Reflection[];
    } catch (err: any) {
      toast({
        title: 'Unable to load reflections',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteReflection = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await invokeEdgeFunction('delete-reflection', { id });

      if (error) {
        toast({
          title: 'Unable to delete',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Deleted',
        description: 'Reflection removed from your journal.',
      });
    } catch (err: any) {
      toast({
        title: 'Unable to delete',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    saveReflection,
    listReflections,
    deleteReflection,
    loading
  };
}

import { supabase } from './supabase';

export interface PresetSchedule {
  id: string;
  user_id: string;
  preset_id: string;
  schedule_name: string;
  time_of_day: string;
  days_of_week: number[];
  is_active: boolean;
  notification_minutes_before: number;
  created_at: string;
  updated_at: string;
  soundicine_presets?: any;
}

export const createSchedule = async (schedule: Omit<PresetSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('preset_schedules')
    .insert([schedule])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSchedules = async () => {
  const { data, error } = await supabase
    .from('preset_schedules')
    .select(`
      *,
      soundicine_presets (*)
    `)
    .order('time_of_day', { ascending: true });
  
  if (error) throw error;
  return data as PresetSchedule[];
};

export const updateSchedule = async (id: string, updates: Partial<PresetSchedule>) => {
  const { data, error } = await supabase
    .from('preset_schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSchedule = async (id: string) => {
  const { error } = await supabase
    .from('preset_schedules')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getDueSchedules = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);
  
  return { currentDay, currentTime };
};

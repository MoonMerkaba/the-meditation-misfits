import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { getSchedules, updateSchedule, deleteSchedule, PresetSchedule } from '@/lib/presetScheduling';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ScheduleListProps {
  onEdit: (schedule: PresetSchedule) => void;
  refreshTrigger?: number;
}

export const ScheduleList = ({ onEdit, refreshTrigger }: ScheduleListProps) => {
  const [schedules, setSchedules] = useState<PresetSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [refreshTrigger]);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateSchedule(id, { is_active: !isActive });
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, is_active: !isActive } : s));
      toast.success(isActive ? 'Schedule paused' : 'Schedule activated');
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast.success('Schedule deleted');
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  if (loading) return <div className="text-purple-300">Loading schedules...</div>;
  if (schedules.length === 0) return <div className="text-purple-300">No schedules yet</div>;

  return (
    <div className="space-y-3">
      {schedules.map(schedule => (
        <Card key={schedule.id} className="bg-purple-900/30 border-purple-500/30 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium">{schedule.schedule_name}</h4>
              <p className="text-purple-300 text-sm">{schedule.soundicine_presets?.preset_name}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-purple-200">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {schedule.time_of_day}
                </span>
                <span className="flex gap-1">
                  {schedule.days_of_week.map(d => DAYS[d]).join(', ')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={schedule.is_active} onCheckedChange={() => handleToggle(schedule.id, schedule.is_active)} />
              <Button size="sm" variant="ghost" onClick={() => onEdit(schedule)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(schedule.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

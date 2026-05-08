import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSchedule, updateSchedule, PresetSchedule } from '@/lib/presetScheduling';
import { toast } from 'sonner';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetId: string;
  presetName: string;
  schedule?: PresetSchedule;
  onSuccess: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ScheduleModal = ({ isOpen, onClose, presetId, presetName, schedule, onSuccess }: ScheduleModalProps) => {
  const [name, setName] = useState(schedule?.schedule_name || `${presetName} Schedule`);
  const [time, setTime] = useState(schedule?.time_of_day || '09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>(schedule?.days_of_week || [1,2,3,4,5]);
  const [notifyBefore, setNotifyBefore] = useState(schedule?.notification_minutes_before || 5);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error('Select at least one day');
      return;
    }

    setLoading(true);
    try {
      if (schedule) {
        await updateSchedule(schedule.id, {
          schedule_name: name,
          time_of_day: time,
          days_of_week: selectedDays,
          notification_minutes_before: notifyBefore
        });
        toast.success('Schedule updated');
      } else {
        await createSchedule({
          preset_id: presetId,
          schedule_name: name,
          time_of_day: time,
          days_of_week: selectedDays,
          is_active: true,
          notification_minutes_before: notifyBefore
        });
        toast.success('Schedule created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit' : 'Create'} Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Schedule Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div>
            <Label>Days</Label>
            <div className="flex gap-2 mt-2">
              {DAYS.map((day, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant={selectedDays.includes(idx) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(idx)}
                  className="flex-1"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Notify Before (minutes)</Label>
            <Select value={notifyBefore.toString()} onValueChange={(v) => setNotifyBefore(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Schedule'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

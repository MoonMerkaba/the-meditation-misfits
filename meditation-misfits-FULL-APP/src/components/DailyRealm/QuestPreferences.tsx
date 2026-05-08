import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Brain, BookOpen, Users, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const iconMap: any = {
  Brain, BookOpen, Users, Trophy
};

export function QuestPreferences() {
  const [types, setTypes] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: typesData } = await supabase.from('quest_types').select('*');
      const { data: prefsData } = await supabase
        .from('user_quest_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (typesData) {
        setTypes(typesData);
        const prefMap: any = {};
        typesData.forEach((type: any) => {
          const pref = prefsData?.find((p: any) => p.quest_type_id === type.id);
          prefMap[type.id] = pref ? pref.enabled : true;
        });
        setPreferences(prefMap);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (typeId: string) => {
    setPreferences({ ...preferences, [typeId]: !preferences[typeId] });
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const typeId in preferences) {
        await supabase.from('user_quest_preferences').upsert({
          user_id: user.id,
          quest_type_id: typeId,
          enabled: preferences[typeId]
        }, { onConflict: 'user_id,quest_type_id' });
      }

      toast.success('Quest preferences saved!');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <h3 className="text-xl font-bold mb-4">Quest Preferences</h3>
      <p className="text-sm text-gray-400 mb-6">Choose which types of quests you want to receive daily</p>
      
      <div className="space-y-4 mb-6">
        {types.map((type) => {
          const Icon = iconMap[type.icon] || Trophy;
          return (
            <div key={type.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 text-${type.color}-400`} />
                <div>
                  <p className="font-semibold">{type.display_name}</p>
                  <p className="text-xs text-gray-400">{type.description}</p>
                </div>
              </div>
              <Switch
                checked={preferences[type.id]}
                onCheckedChange={() => togglePreference(type.id)}
              />
            </div>
          );
        })}
      </div>

      <Button onClick={savePreferences} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Preferences'}
      </Button>
    </Card>
  );
}
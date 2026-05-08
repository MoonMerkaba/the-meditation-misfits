import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface JournalFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFrequency: string;
  onFrequencyChange: (value: string) => void;
  selectedIntention: string;
  onIntentionChange: (value: string) => void;
  intentions: Array<{ id: string; title: string }>;
}

const FREQUENCIES = [
  { value: 'all', label: 'All Frequencies' },
  { value: '174', label: '174 Hz - Foundation' },
  { value: '285', label: '285 Hz - Healing' },
  { value: '396', label: '396 Hz - Liberation' },
  { value: '417', label: '417 Hz - Change' },
  { value: '432', label: '432 Hz - Harmony' },
  { value: '528', label: '528 Hz - Love' },
  { value: '639', label: '639 Hz - Connection' },
  { value: '741', label: '741 Hz - Expression' },
  { value: '852', label: '852 Hz - Intuition' },
  { value: '963', label: '963 Hz - Unity' }
];

export function JournalFilters({
  searchQuery,
  onSearchChange,
  selectedFrequency,
  onFrequencyChange,
  selectedIntention,
  onIntentionChange,
  intentions
}: JournalFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Find a reflection..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedFrequency} onValueChange={onFrequencyChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCIES.map(freq => (
            <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedIntention} onValueChange={onIntentionChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="All Intentions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Intentions</SelectItem>
          {intentions.map(int => (
            <SelectItem key={int.id} value={int.id}>{int.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
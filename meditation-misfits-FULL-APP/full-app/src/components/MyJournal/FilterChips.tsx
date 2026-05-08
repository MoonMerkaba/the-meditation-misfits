import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface FilterChipsProps {
  searchQuery: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  selectedFrequency: string;
  selectedHz: string;
  onClearSearch: () => void;
  onClearDateFrom: () => void;
  onClearDateTo: () => void;
  onClearFrequency: () => void;
  onClearHz: () => void;
  onClearAll: () => void;
}

export function FilterChips({
  searchQuery,
  dateFrom,
  dateTo,
  selectedFrequency,
  selectedHz,
  onClearSearch,
  onClearDateFrom,
  onClearDateTo,
  onClearFrequency,
  onClearHz,
  onClearAll
}: FilterChipsProps) {
  const hasFilters = searchQuery || dateFrom || dateTo || 
    (selectedFrequency && selectedFrequency !== 'all') || 
    (selectedHz && selectedHz !== 'all');

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-400">Active filters:</span>
      
      {searchQuery && (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 gap-1">
          Search: {searchQuery}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearSearch} />
        </Badge>
      )}

      {dateFrom && (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 gap-1">
          From: {format(dateFrom, 'MMM d, yyyy')}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearDateFrom} />
        </Badge>
      )}

      {dateTo && (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 gap-1">
          To: {format(dateTo, 'MMM d, yyyy')}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearDateTo} />
        </Badge>
      )}

      {selectedFrequency && selectedFrequency !== 'all' && (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 gap-1">
          Frequency: {selectedFrequency}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearFrequency} />
        </Badge>
      )}

      {selectedHz && selectedHz !== 'all' && (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 gap-1">
          Hz: {selectedHz}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearHz} />
        </Badge>
      )}

      <button
        onClick={onClearAll}
        className="text-sm text-purple-400 hover:text-purple-300 underline"
      >
        Clear all
      </button>
    </div>
  );
}

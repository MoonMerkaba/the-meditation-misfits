import { Card } from '@/components/ui/card';
import { BookOpen, Clock } from 'lucide-react';

interface ArticleCardProps {
  title: string;
  description: string;
  category: string;
  readTime: string;
  onClick: () => void;
}

export function ArticleCard({ title, description, category, readTime, onClick }: ArticleCardProps) {
  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all cursor-pointer border-purple-200 hover:border-purple-400"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
          {category}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {readTime}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );
}

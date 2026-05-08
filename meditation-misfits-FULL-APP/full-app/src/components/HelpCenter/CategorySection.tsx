import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CategorySectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  articleCount: number;
  onClick: () => void;
}

export function CategorySection({ icon: Icon, title, description, articleCount, onClick }: CategorySectionProps) {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all cursor-pointer border-purple-200 hover:border-purple-400 hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <span className="text-xs text-purple-600 font-semibold">{articleCount} articles</span>
        </div>
      </div>
    </Card>
  );
}

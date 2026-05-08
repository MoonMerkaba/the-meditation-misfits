import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TemplateCardProps {
  template: {
    id: string;
    category: string;
    title: string;
    description: string;
    north_star: string;
    area: string;
    image_url: string;
    suggested_actions: string[];
    example_wins: string[];
  };
  onSelect: (template: any) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={template.image_url}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className="absolute top-4 right-4 bg-white/90 text-gray-900">
          {template.category}
        </Badge>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
          <p className="text-sm text-gray-600">{template.description}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm italic text-purple-900">"{template.north_star}"</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase">Suggested Actions:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {template.suggested_actions.slice(0, 3).map((action, idx) => (
              <li key={idx}>• {action}</li>
            ))}
          </ul>
        </div>
        <Button onClick={() => onSelect(template)} className="w-full">
          Use This Template
        </Button>
      </div>
    </Card>
  );
}

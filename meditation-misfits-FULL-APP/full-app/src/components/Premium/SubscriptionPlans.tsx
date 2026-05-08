import { Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SubscriptionPlansProps {
  onSelectPlan: (planType: 'monthly' | 'yearly') => void;
  loading?: boolean;
}

export const SubscriptionPlans = ({ onSelectPlan, loading }: SubscriptionPlansProps) => {
  const features = [
    'Exclusive frequency tracks & meditations',
    'Advanced neural recalibration sessions',
    'Unlimited daily usage',
    'Progress tracking & analytics',
    'Premium community badge',
    'Early access to new features',
    'Member-only discounts'
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <Card className="p-6 border-2 hover:border-purple-500 transition-all">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Monthly</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">$14.99</span>
            <span className="text-gray-500">/month</span>
          </div>
          <p className="text-sm text-purple-400 font-semibold mt-2">7-day free trial</p>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={() => onSelectPlan('monthly')}
          disabled={loading}
          className="w-full"
        >
          Start Monthly
        </Button>
      </Card>

      <Card className="p-6 border-2 border-yellow-500 relative hover:border-yellow-400 transition-all">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Crown className="w-4 h-4" />
          Best Value
        </div>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Yearly</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">$144</span>
            <span className="text-gray-500">/year</span>
          </div>
          <p className="text-sm text-purple-400 font-semibold mt-1">7-day free trial</p>
          <p className="text-sm text-green-600 font-semibold">Save $36/year</p>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={() => onSelectPlan('yearly')}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600"
        >
          Start Yearly
        </Button>
      </Card>
    </div>
  );
};

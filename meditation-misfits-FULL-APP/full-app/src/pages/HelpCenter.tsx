import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArticleCard } from '@/components/HelpCenter/ArticleCard';
import { CategorySection } from '@/components/HelpCenter/CategorySection';
import ChatWidget from '@/components/Support/ChatWidget';
import { 
  Search, BookOpen, Zap, Wrench, CreditCard, Settings, 
  Heart, TrendingUp, Mail, MessageCircle, Play, Star 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const categories = [
  { icon: Zap, title: 'Getting Started', description: 'Learn the basics and set up your account', count: 8 },
  { icon: BookOpen, title: 'Feature Tutorials', description: 'Master all the powerful features', count: 15 },
  { icon: Wrench, title: 'Troubleshooting', description: 'Fix common issues quickly', count: 12 },
  { icon: CreditCard, title: 'Subscription & Billing', description: 'Manage your subscription', count: 7 },
  { icon: Settings, title: 'Account Settings', description: 'Customize your experience', count: 9 },
  { icon: Heart, title: 'Meditation Best Practices', description: 'Tips for deeper practice', count: 11 },
];

const popularArticles = [
  { title: 'How to Get Started with Freqyn', description: 'Complete guide to setting up your account', category: 'Getting Started', readTime: '5 min' },
  { title: 'Understanding Frequency Healing', description: 'Learn how sound frequencies affect your wellbeing', category: 'Best Practices', readTime: '8 min' },
  { title: 'Creating Your First Custom Meditation', description: 'Step-by-step guide to AI meditation generation', category: 'Features', readTime: '6 min' },
  { title: 'Troubleshooting Audio Playback', description: 'Fix common audio issues', category: 'Troubleshooting', readTime: '4 min' },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [filteredCategories, setFilteredCategories] = useState(categories);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = categories.filter(cat => 
        cat.title.toLowerCase().includes(query.toLowerCase()) ||
        cat.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg mb-8 opacity-90">Search our knowledge base or browse categories below</p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for articles, guides, or tutorials..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg rounded-full border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer border-purple-200">
            <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600 mb-3">Get help from our team</p>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/contact'}>
              Contact Us
            </Button>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer border-purple-200">
            <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Community Forum</h3>
            <p className="text-sm text-gray-600 mb-3">Ask the community</p>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              Visit Forum
            </Button>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer border-purple-200">
            <Play className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Video Tutorials</h3>
            <p className="text-sm text-gray-600 mb-3">Watch and learn</p>
            <Button variant="outline" size="sm" onClick={() => setSelectedArticle({ title: 'Video Tutorials', type: 'video' })}>
              Watch Now
            </Button>
          </Card>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Articles</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <ArticleCard
                key={index}
                {...article}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <CategorySection
                key={index}
                icon={category.icon}
                title={category.title}
                description={category.description}
                articleCount={category.count}
                onClick={() => setSelectedArticle({ title: category.title, type: 'category' })}
              />
            ))}
          </div>
        </div>

        {/* Video Tutorials Section */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Play className="w-6 h-6 text-purple-600" />
            Video Tutorials
          </h2>
          <p className="text-gray-700 mb-6">Watch step-by-step video guides to master Freqyn</p>
          <div className="grid md:grid-cols-3 gap-4">
            {['Getting Started Tour', 'Custom Meditation Guide', 'Advanced Features'].map((title, i) => (
              <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedArticle({ title, type: 'video' })}>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg h-32 flex items-center justify-center mb-3">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-gray-600 mt-1">12 min</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Article Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none">
            {selectedArticle?.type === 'video' ? (
              <div>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                  <Play className="w-16 h-16 text-gray-400" />
                </div>
                <p>Video tutorial content would be displayed here.</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">{selectedArticle?.description}</p>
                <p>Full article content would be displayed here with detailed instructions, screenshots, and helpful tips.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Chat Widget */}
      <ChatWidget />
    </div>
  );
}
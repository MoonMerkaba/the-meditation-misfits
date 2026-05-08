import React, { useState, useEffect } from 'react';
import { useShadowSafe } from '@/contexts/ShadowSafeContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Gift, 
  Download, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Star,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  Unlock,
  User,
  Loader2,
  ShieldCheck,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

const HERO_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1766729804622_a23b4984.png";
const STORAGE_KEY = 'freebies_access_granted';

interface FreebieItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  downloadUrl?: string;
  featured?: boolean;
}

const freebies: FreebieItem[] = [
  {
    id: '1',
    title: 'Shadow Work Journal',
    description: 'A comprehensive 30-day journal to help you explore your shadow self and integrate hidden aspects of your personality.',
    image: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1766729826838_8479cbb3.jpg',
    category: 'Journal',
    featured: true
  },
  {
    id: '2',
    title: 'Chakra Healing Guide',
    description: 'Learn to balance and align your energy centers with this beautifully illustrated guide.',
    image: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1766729827645_6151da3f.png',
    category: 'Guide'
  },
  {
    id: '3',
    title: 'Manifestation Workbook',
    description: 'Step-by-step exercises to clarify your intentions and manifest your dreams into reality.',
    image: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1766729826781_ac9c81b6.jpg',
    category: 'Workbook'
  },
  {
    id: '4',
    title: 'Morning Ritual Cards',
    description: 'Printable affirmation and ritual cards to start your day with intention and purpose.',
    image: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1766729833206_36e9f15f.png',
    category: 'Cards'
  },
  {
    id: '5',
    title: 'Moon Phase Tracker',
    description: 'Track lunar cycles and align your rituals with the moon\'s powerful energy.',
    image: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1766729826615_ce4904fb.jpg',
    category: 'Tracker'
  },
  {
    id: '6',
    title: 'Meditation Starter Kit',
    description: 'Everything you need to begin your meditation practice, including guided scripts and tips.',
    image: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1766729830216_cb0686f9.jpg',
    category: 'Kit'
  }
];

const categories = ['All', 'Journal', 'Guide', 'Workbook', 'Cards', 'Tracker', 'Kit'];

const benefits = [
  {
    icon: BookOpen,
    title: 'Shadow Work Journal',
    description: '30-day guided prompts for deep self-discovery'
  },
  {
    icon: Zap,
    title: 'Chakra Healing Guide',
    description: 'Balance your energy centers with practical exercises'
  },
  {
    icon: Star,
    title: 'Manifestation Workbook',
    description: 'Step-by-step process to manifest your dreams'
  },
  {
    icon: Moon,
    title: 'Moon Phase Tracker',
    description: 'Align your rituals with lunar cycles'
  },
  {
    icon: Sun,
    title: 'Morning Ritual Cards',
    description: 'Printable affirmations for daily intention'
  },
  {
    icon: Heart,
    title: 'Meditation Starter Kit',
    description: 'Everything you need to begin meditating'
  }
];

interface FreebiesPageProps {
  onBack?: () => void;
}

const FreebiesPage: React.FC<FreebiesPageProps> = ({ onBack }) => {
  const { isShadowSafeMode } = useShadowSafe();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Check if user already has access
  useEffect(() => {
    const checkAccess = () => {
      const accessGranted = localStorage.getItem(STORAGE_KEY);
      if (accessGranted === 'true') {
        setHasAccess(true);
      }
      setIsLoading(false);
    };
    checkAccess();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Call the Constant Contact edge function
      const { data, error: fnError } = await supabase.functions.invoke('add-to-constant-contact', {
        body: {
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: ''
        }
      });

      // Handle edge function transport errors
      if (fnError) {
        // Check if it's an HTML response (common 2xx issue)
        const errMsg = fnError.message || '';
        if (errMsg.includes('<!DOCTYPE') || errMsg.includes('<html')) {
          throw new Error('Service temporarily unavailable. Please try again in a moment.');
        }
        throw new Error(errMsg || 'Unable to process your request right now. Please try again.');
      }

      // Handle application-level errors in the response data
      if (data && typeof data === 'object' && data.error) {
        throw new Error(data.error);
      }

      // Grant access
      localStorage.setItem(STORAGE_KEY, 'true');
      setHasAccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      const message = err.message || 'Something went wrong. Please try again.';
      // Replace technical messages with user-friendly ones
      if (message.includes('FunctionsFetchError') || message.includes('2xx') || message.includes('status code')) {
        setError('Our service is momentarily busy. Please try again in a few seconds.');
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFreebies = selectedCategory === 'All' 
    ? freebies 
    : freebies.filter(f => f.category === selectedCategory);

  const featuredFreebie = freebies.find(f => f.featured);

  const handleDownload = (freebie: FreebieItem) => {
    window.open('https://samanthabushika.com/pnp-freebies/', '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={`w-8 h-8 animate-spin ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`} />
      </div>
    );
  }

  // Lead Magnet Gate - Show signup form if no access
  if (!hasAccess) {
    return (
      <div className={`min-h-screen pt-[180px] md:pt-[240px] pb-32 ${isShadowSafeMode ? 'bg-brand-black' : ''}`}>
        {/* Hero Background */}
        <div className="fixed inset-0 z-0">
          <img 
            src={HERO_IMAGE} 
            alt="Freebies" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className={`absolute inset-0 ${
            isShadowSafeMode 
              ? 'bg-gradient-to-b from-brand-black/80 via-brand-black/95 to-brand-black' 
              : 'bg-gradient-to-b from-brand-black/80 via-brand-black/95 to-brand-black'
          }`} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Value Proposition */}
            <div className="text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                isShadowSafeMode 
                  ? 'bg-brand-blue-gray/20 border border-brand-blue-gray/30' 
                  : 'bg-brand-magenta/20 border border-brand-magenta/30'
              }`}>
                <Lock className={`w-4 h-4 ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`} />
                <span className={`text-sm font-medium ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`}>
                  Exclusive Access
                </span>
              </div>

              <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl text-brand-white mb-6 font-bold tracking-tight">
                Unlock Your Free
                <span className={`block ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`}>
                  Transformation Kit
                </span>
              </h1>

              <p className="text-lg md:text-xl text-brand-light-gray/80 mb-8 max-w-xl">
                Get instant access to our complete collection of journals, guides, and tools 
                designed to support your personal development journey.
              </p>

              {/* What's Included */}
              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-medium text-brand-light-gray/60 uppercase tracking-wider">
                  What's Included:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        isShadowSafeMode 
                          ? 'bg-brand-dark-gray/30 border border-brand-blue-gray/10' 
                          : 'bg-brand-dark-gray/30 border border-brand-magenta/10'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${
                        isShadowSafeMode ? 'bg-brand-blue-gray/20' : 'bg-brand-magenta/20'
                      }`}>
                        <benefit.icon className={`w-4 h-4 ${
                          isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-brand-white">{benefit.title}</h4>
                        <p className="text-xs text-brand-light-gray/60">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-brand-light-gray/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>No Spam Ever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  <span>Instant Access</span>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className={`rounded-2xl p-8 md:p-10 ${
              isShadowSafeMode 
                ? 'bg-gradient-to-br from-brand-dark-gray to-brand-dark-gray/60 border border-brand-blue-gray/20' 
                : 'bg-gradient-to-br from-brand-dark-gray to-brand-dark-gray/60 border border-brand-magenta/20 shadow-brand-lg'
            }`}>
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  isShadowSafeMode ? 'bg-brand-blue-gray/20' : 'bg-brand-magenta/20'
                }`}>
                  <Gift className={`w-8 h-8 ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`} />
                </div>
                <h2 className="font-sans text-2xl md:text-3xl text-brand-white mb-2 font-bold">
                  Get Your Free Resources
                </h2>
                <p className="text-brand-light-gray/70">
                  Enter your details below for instant access
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-light-gray/80 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-light-gray/50" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Your first name"
                      required
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-brand-black/50 border text-brand-white placeholder:text-brand-light-gray/50 focus:outline-none focus:ring-2 transition-all ${
                        isShadowSafeMode 
                          ? 'border-brand-blue-gray/30 focus:ring-brand-blue-gray/50 focus:border-brand-blue-gray' 
                          : 'border-brand-magenta/30 focus:ring-brand-magenta/50 focus:border-brand-magenta'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-light-gray/80 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-light-gray/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-brand-black/50 border text-brand-white placeholder:text-brand-light-gray/50 focus:outline-none focus:ring-2 transition-all ${
                        isShadowSafeMode 
                          ? 'border-brand-blue-gray/30 focus:ring-brand-blue-gray/50 focus:border-brand-blue-gray' 
                          : 'border-brand-magenta/30 focus:ring-brand-magenta/50 focus:border-brand-magenta'
                      }`}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 text-lg font-sans transition-all ${
                    isShadowSafeMode 
                      ? 'bg-brand-blue-gray text-brand-black hover:bg-brand-blue-gray/90' 
                      : 'bg-brand-magenta text-white hover:bg-brand-magenta/90 shadow-brand-md hover:shadow-brand-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Unlocking Access...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5 mr-2" />
                      Get Instant Access
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-brand-light-gray/50 mt-4">
                  By signing up, you agree to receive occasional emails with resources and updates. 
                  Unsubscribe anytime.
                </p>
              </form>

              {/* Social Proof */}
              <div className={`mt-8 pt-6 border-t ${
                isShadowSafeMode ? 'border-brand-blue-gray/20' : 'border-brand-magenta/20'
              }`}>
                <div className="flex items-center justify-center gap-2 text-sm text-brand-light-gray/60">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i}
                        className={`w-8 h-8 rounded-full border-2 border-brand-dark-gray flex items-center justify-center text-xs font-medium ${
                          isShadowSafeMode ? 'bg-brand-blue-gray/30 text-brand-blue-gray' : 'bg-brand-magenta/30 text-brand-magenta'
                        }`}
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span>Join 2,500+ seekers on their journey</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview of Freebies */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <h2 className="font-sans text-2xl md:text-3xl text-brand-white mb-3 font-bold">
                Peek Inside Your Free Kit
              </h2>
              <p className="text-brand-light-gray/70">
                Here's a preview of what you'll unlock
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {freebies.map((freebie) => (
                <div
                  key={freebie.id}
                  className={`group relative rounded-xl overflow-hidden ${
                    isShadowSafeMode 
                      ? 'border border-brand-blue-gray/20' 
                      : 'border border-brand-magenta/20'
                  }`}
                >
                  <div className="aspect-[3/4] relative">
                    <img 
                      src={freebie.image} 
                      alt={freebie.title}
                      className="w-full h-full object-cover filter blur-[2px] group-hover:blur-[1px] transition-all"
                    />
                    <div className="absolute inset-0 bg-brand-black/60 flex items-center justify-center">
                      <Lock className={`w-6 h-6 ${isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-magenta/60'}`} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-brand-black to-transparent">
                    <p className="text-xs text-brand-white/80 truncate">{freebie.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Freebies Page - Show after access granted
  return (
    <div className={`min-h-screen pt-[180px] md:pt-[240px] pb-32 ${isShadowSafeMode ? 'bg-brand-black' : ''}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={HERO_IMAGE} 
            alt="Freebies" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className={`absolute inset-0 ${
            isShadowSafeMode 
              ? 'bg-gradient-to-b from-brand-black/60 via-brand-black/80 to-brand-black' 
              : 'bg-gradient-to-b from-brand-black/60 via-brand-black/80 to-brand-black'
          }`} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              isShadowSafeMode 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-green-500/20 border border-green-500/30'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Access Unlocked
              </span>
            </div>
            
            <h1 className="font-sans text-4xl md:text-6xl text-brand-white mb-4 font-bold tracking-tight">
              Your Free Resources
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto ${
              isShadowSafeMode ? 'text-brand-light-gray/80' : 'text-brand-light-gray/80'
            }`}>
              Welcome! Download your curated digital products to support your personal development journey.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => window.open('https://samanthabushika.com/pnp-freebies/', '_blank', 'noopener,noreferrer')}
                className={`px-8 py-6 text-lg font-sans ${
                  isShadowSafeMode 
                    ? 'bg-brand-blue-gray text-brand-black hover:bg-brand-blue-gray/90' 
                    : 'bg-brand-magenta text-white hover:bg-brand-magenta/90 shadow-brand-md'
                }`}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Visit Full Freebies Page
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('freebies-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-6 py-6 ${
                  isShadowSafeMode 
                    ? 'border-brand-blue-gray/30 text-brand-blue-gray hover:bg-brand-blue-gray/10' 
                    : 'border-brand-magenta/30 text-brand-magenta hover:bg-brand-magenta/10'
                }`}
              >
                Browse Below
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Freebie */}
      {featuredFreebie && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className={`rounded-2xl overflow-hidden ${
            isShadowSafeMode 
              ? 'bg-gradient-to-r from-brand-dark-gray to-brand-dark-gray/80 border border-brand-blue-gray/20' 
              : 'bg-gradient-to-r from-brand-dark-gray to-brand-dark-gray/80 border border-brand-magenta/20'
          }`}>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3">
                <img 
                  src={featuredFreebie.image} 
                  alt={featuredFreebie.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6 md:p-10 flex flex-col justify-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit mb-4 ${
                  isShadowSafeMode 
                    ? 'bg-brand-blue-gray/20 text-brand-blue-gray' 
                    : 'bg-brand-magenta/20 text-brand-magenta'
                }`}>
                  <Star className="w-3 h-3" />
                  <span className="text-xs font-medium">Featured Resource</span>
                </div>
                <h2 className="font-sans text-2xl md:text-3xl text-brand-white mb-3 font-bold">
                  {featuredFreebie.title}
                </h2>
                <p className="text-brand-light-gray/80 mb-6">
                  {featuredFreebie.description}
                </p>
                <Button
                  onClick={() => handleDownload(featuredFreebie)}
                  className={`w-fit ${
                    isShadowSafeMode 
                      ? 'bg-brand-blue-gray text-brand-black hover:bg-brand-blue-gray/90' 
                      : 'bg-brand-magenta text-white hover:bg-brand-magenta/90'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Get Free Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div id="freebies-grid" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? isShadowSafeMode
                    ? 'bg-brand-blue-gray text-brand-black'
                    : 'bg-brand-magenta text-white'
                  : isShadowSafeMode
                    ? 'bg-brand-dark-gray/50 text-brand-light-gray/70 hover:bg-brand-blue-gray/20 border border-brand-blue-gray/20'
                    : 'bg-brand-dark-gray/50 text-brand-light-gray/70 hover:bg-brand-magenta/20 border border-brand-magenta/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Freebies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreebies.map(freebie => (
            <div
              key={freebie.id}
              className={`group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isShadowSafeMode 
                  ? 'bg-brand-dark-gray/50 border border-brand-blue-gray/20 hover:border-brand-blue-gray/40' 
                  : 'bg-brand-dark-gray/50 border border-brand-magenta/20 hover:border-brand-magenta/40 hover:shadow-brand-sm'
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img 
                  src={freebie.image} 
                  alt={freebie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                  isShadowSafeMode 
                    ? 'bg-brand-blue-gray/90 text-brand-black' 
                    : 'bg-brand-magenta/90 text-white'
                }`}>
                  {freebie.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-sans text-xl text-brand-white mb-2 font-semibold">
                  {freebie.title}
                </h3>
                <p className="text-sm text-brand-light-gray/70 mb-4 line-clamp-2">
                  {freebie.description}
                </p>
                <Button
                  onClick={() => handleDownload(freebie)}
                  variant="outline"
                  className={`w-full ${
                    isShadowSafeMode 
                      ? 'border-brand-blue-gray/30 text-brand-blue-gray hover:bg-brand-blue-gray/10' 
                      : 'border-brand-magenta/30 text-brand-magenta hover:bg-brand-magenta/10'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Free Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="font-sans text-2xl md:text-3xl text-brand-white mb-3 font-bold">
            Why Our Freebies?
          </h2>
          <p className="text-brand-light-gray/70">
            Created with love to support your unique journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-xl p-6 text-center ${
            isShadowSafeMode 
              ? 'bg-brand-dark-gray/30 border border-brand-blue-gray/15' 
              : 'bg-brand-dark-gray/30 border border-brand-magenta/15'
          }`}>
            <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isShadowSafeMode 
                ? 'bg-brand-blue-gray/20' 
                : 'bg-brand-magenta/20'
            }`}>
              <Heart className={`w-6 h-6 ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`} />
            </div>
            <h3 className="font-medium text-brand-white mb-2">Made with Intention</h3>
            <p className="text-sm text-brand-light-gray/70">
              Each resource is thoughtfully designed to support your personal growth
            </p>
          </div>
          
          <div className={`rounded-xl p-6 text-center ${
            isShadowSafeMode 
              ? 'bg-brand-dark-gray/30 border border-brand-blue-gray/15' 
              : 'bg-brand-dark-gray/30 border border-brand-magenta/15'
          }`}>
            <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isShadowSafeMode 
                ? 'bg-brand-blue-gray/20' 
                : 'bg-brand-magenta/20'
            }`}>
              <BookOpen className={`w-6 h-6 ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`} />
            </div>
            <h3 className="font-medium text-brand-white mb-2">Practical & Actionable</h3>
            <p className="text-sm text-brand-light-gray/70">
              Real exercises and tools you can use immediately in your daily practice
            </p>
          </div>
          
          <div className={`rounded-xl p-6 text-center ${
            isShadowSafeMode 
              ? 'bg-brand-dark-gray/30 border border-brand-blue-gray/15' 
              : 'bg-brand-dark-gray/30 border border-brand-magenta/15'
          }`}>
            <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isShadowSafeMode 
                ? 'bg-brand-blue-gray/20' 
                : 'bg-brand-magenta/20'
            }`}>
              <Sparkles className={`w-6 h-6 ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`} />
            </div>
            <h3 className="font-medium text-brand-white mb-2">Always Free</h3>
            <p className="text-sm text-brand-light-gray/70">
              No hidden costs or upsells - just genuine resources to help you thrive
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className={`text-lg mb-6 ${isShadowSafeMode ? 'text-brand-light-gray/80' : 'text-brand-light-gray/80'}`}>
          Want even more resources? Visit the full freebies page for our complete collection.
        </p>
        <Button
          onClick={() => window.open('https://samanthabushika.com/pnp-freebies/', '_blank', 'noopener,noreferrer')}
          size="lg"
          className={`px-10 py-6 text-lg font-sans ${
            isShadowSafeMode 
              ? 'bg-brand-blue-gray text-brand-black hover:bg-brand-blue-gray/90' 
              : 'bg-brand-magenta text-white hover:bg-brand-magenta/90 shadow-brand-md'
          }`}
        >
          <Gift className="w-5 h-5 mr-2" />
          Explore All Freebies
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FreebiesPage;

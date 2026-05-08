import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, X, Home, BookOpen, Heart, Users, HelpCircle, Mail, User,
  Sparkles, Gift, Eye, LogIn, Lock, Waves, Wind, Target, Moon
} from 'lucide-react';

const BRAND_BANNER_URL = "https://d64gsuwffb70l.cloudfront.net/68a6970494aea82044a784a2_1766726918324_48d16356.png";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onShowAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onShowAuth }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'meditationLibrary', label: 'Meditations', icon: Sparkles },
    { id: 'journal', label: 'Journal', icon: BookOpen, requiresAuth: true },
    { id: 'playlist', label: 'Favorites', icon: Heart, requiresAuth: true },
    { id: 'oracleDashboard', label: 'Oracle', icon: Eye },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'freebies', label: 'Freebies', icon: Gift },
  ];

  const moreItems = [
    { id: 'mixer', label: 'Frequency Mixer', icon: Waves },
    { id: 'breathwork', label: 'Breathwork', icon: Wind },
    { id: 'manifestation', label: 'Manifestation', icon: Target, href: '/manifestation' },
    { id: 'vault', label: 'Vault', icon: Lock, href: '/vault' },
    { id: 'help', label: 'Help', icon: HelpCircle, href: '/help' },
    { id: 'contact', label: 'Contact', icon: Mail, href: '/contact' },
  ];

  const handleNavClick = (item: { id: string; requiresAuth?: boolean; href?: string }) => {
    if (item.requiresAuth && !user) {
      onShowAuth();
      return;
    }
    if (item.href) {
      window.location.href = item.href;
      return;
    }
    onNavigate(item.id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Brand Banner */}
      <div 
        className="w-full cursor-pointer"
        style={{ background: '#000000' }}
        onClick={() => onNavigate('home')}
      >
        <img 
          src={BRAND_BANNER_URL} 
          alt="The Meditation Misfits" 
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Navigation Bar */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.95)', 
        borderBottom: '1px solid rgba(255, 0, 191, 0.15)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200"
                    style={{
                      color: isActive ? '#FF00BF' : '#A2A1A3',
                      background: isActive ? 'rgba(255, 0, 191, 0.1)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#FF00BF';
                        e.currentTarget.style.background = 'rgba(255, 0, 191, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#A2A1A3';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile: Home button */}
            <button
              onClick={() => onNavigate('home')}
              className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium"
              style={{ color: currentView === 'home' ? '#FF00BF' : '#A2A1A3' }}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Auth Button */}
              {user ? (
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  style={{ color: currentView === 'profile' ? '#FF00BF' : '#A2A1A3' }}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user.name?.split(' ')[0] || 'Profile'}</span>
                </button>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200"
                  style={{ 
                    background: '#FF00BF', 
                    color: '#FFFFFF',
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 transition-colors duration-200"
                style={{ color: '#A2A1A3' }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.98)', 
            borderTop: '1px solid rgba(255, 0, 191, 0.1)' 
          }}>
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {[...navItems, ...moreItems].map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200"
                    style={{
                      color: isActive ? '#FF00BF' : '#A2A1A3',
                      background: isActive ? 'rgba(255, 0, 191, 0.1)' : 'transparent',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

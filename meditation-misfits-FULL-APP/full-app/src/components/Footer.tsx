import React from 'react';
import { 
  Heart, Mail, HelpCircle, Shield, FileText,
  Sparkles, Moon, Users, BookOpen
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const quickLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Meditations', view: 'meditationLibrary' },
    { label: 'Daily Ritual', href: '/daily-ritual' },
    { label: 'Oracle', view: 'oracleDashboard' },
    { label: 'Community', view: 'community' },
    { label: 'Forbidden Program', href: '/forbidden-program' },
  ];

  const resourceLinks = [
    { label: 'Help Center', href: '/help', icon: HelpCircle },
    { label: 'Contact Us', href: '/contact', icon: Mail },
    { label: 'Privacy Policy', href: '/privacy', icon: Shield },
    { label: 'Terms of Service', href: '/terms', icon: FileText },
  ];

  const featureLinks = [
    { label: 'Journal', view: 'journal', icon: BookOpen },
    { label: 'Favorites', view: 'playlist', icon: Heart },
    { label: 'Frequency Mixer', view: 'mixer', icon: Sparkles },
    { label: 'Breathwork', view: 'breathwork', icon: Moon },
  ];

  return (
    <footer style={{ background: '#000000', borderTop: '1px solid rgba(255, 0, 191, 0.15)' }} className="relative mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <p className="text-sm mb-4" style={{ color: '#A2A1A3' }}>
              A sanctuary for lightworkers, starseeds, and sensitive souls. 
              Not a system — a space to belong.
            </p>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: '#FF00BF' }} />
              <span className="text-sm" style={{ color: '#A2A1A3' }}>
                Join our community of misfits
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: '#FF00BF' }}>
              Explore
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  {link.view ? (
                    <button
                      onClick={() => handleNavClick(link.view!)}
                      className="text-sm transition-colors duration-200 hover:underline"
                      style={{ color: '#A2A1A3' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF00BF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#A2A1A3'; }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200 hover:underline"
                      style={{ color: '#A2A1A3' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF00BF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#A2A1A3'; }}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: '#FF00BF' }}>
              Features
            </h4>
            <ul className="space-y-2">
              {featureLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <button
                      onClick={() => handleNavClick(link.view)}
                      className="flex items-center gap-2 text-sm transition-colors duration-200"
                      style={{ color: '#A2A1A3' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF00BF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#A2A1A3'; }}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: '#FF00BF' }}>
              Resources
            </h4>
            <ul className="space-y-2">
              {resourceLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="flex items-center gap-2 text-sm transition-colors duration-200"
                      style={{ color: '#A2A1A3' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF00BF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#A2A1A3'; }}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255, 0, 191, 0.1)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: '#444343' }}>
              © 2025 The Meditation Misfits. All rights reserved.
            </p>
            <p className="text-xs text-center" style={{ color: '#444343' }}>
              For Lightworkers, Starseeds, and sensitive souls everywhere.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

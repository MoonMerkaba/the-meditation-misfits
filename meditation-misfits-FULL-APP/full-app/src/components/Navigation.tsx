import React from 'react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onShowAuth: () => void;
}

// Navigation is handled by the Header component.
// This component is intentionally empty to avoid mobile-style bottom nav bars.
const Navigation: React.FC<NavigationProps> = () => {
  return null;
};

export default Navigation;


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle SPA redirect from 404.html (for Nginx servers)
const handleSpaRedirect = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('redirect');
  
  if (redirectPath) {
    // Clean the URL and let React Router handle the navigation
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, '', redirectPath);
  }
  
  // Also check sessionStorage (backup method)
  const storedPath = sessionStorage.getItem('spa-redirect-path');
  if (storedPath && !redirectPath) {
    sessionStorage.removeItem('spa-redirect-path');
    window.history.replaceState(null, '', storedPath);
  }
};

handleSpaRedirect();

createRoot(document.getElementById("root")!).render(<App />);

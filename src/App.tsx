// src/App.tsx
import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
import SOSButton from './features/emergency/components/SOSButton';
import { useAuth } from './contexts/AuthContext';
import { initBrandingFromLogo } from './utils/branding';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    // Initialize dynamic branding based on logo dominant color
    initBrandingFromLogo();
  }, []);
  return (
      <>
         <AppRouter />
         {isAuthenticated && <SOSButton />}
          <Toaster position="top-center" reverseOrder={false} />
      </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
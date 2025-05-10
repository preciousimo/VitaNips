// src/App.tsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
import SOSButton from './features/emergency/components/SOSButton';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
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
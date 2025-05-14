// src/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback="Loading...">
      <App />
    </Suspense>
  </React.StrictMode>,
);
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';
import { GameSessionProvider } from './context/GameSessionContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import ToastContainer from './components/feedback/ToastContainer';
import AriaLiveAnnouncer from './components/common/AriaLiveAnnouncer';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AudioProvider>
          <AuthProvider>
            <GameSessionProvider>
              <ToastProvider>
                <AriaLiveAnnouncer />
                <ToastContainer />
                <AppRoutes />
              </ToastProvider>
            </GameSessionProvider>
          </AuthProvider>
        </AudioProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

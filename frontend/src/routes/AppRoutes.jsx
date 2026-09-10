import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import GameLayout from '../components/layout/GameLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import GameGuard from './GameGuard';

import LandingPage from '../pages/LandingPage';
import AuthPage from '../pages/AuthPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import DashboardPage from '../pages/DashboardPage';
import AssessmentPage from '../pages/AssessmentPage';
import FacilityIntroPage from '../pages/FacilityIntroPage';
import GameRoomPage from '../pages/GameRoomPage';
import EscapeResultPage from '../pages/EscapeResultPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Authentication Gateway with Dedicated Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      {/* Public and Standard Views with Main Facility Header */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Protected Dashboard and Assessment */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Cinematic Facility Entry */}
      <Route
        path="/facility-entry"
        element={
          <ProtectedRoute>
            <FacilityIntroPage />
          </ProtectedRoute>
        }
      />

      {/* Fullscreen Immersive Escape Room Layout */}
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GameLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="room/:roomId"
          element={
            <GameGuard>
              <GameRoomPage />
            </GameGuard>
          }
        />
        <Route
          path="escape-result/:sessionId"
          element={<EscapeResultPage />}
        />
      </Route>
    </Routes>
  );
}

import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useGameSession, ROOM_ID_TO_SECTOR, SECTOR_MAP } from '../hooks/useGameSession';

export default function GameGuard({ children }) {
  const { session, isLoadingSession, fetchActiveSession } = useGameSession();
  const { roomId } = useParams();

  useEffect(() => {
    if (!session && !isLoadingSession) {
      fetchActiveSession();
    }
  }, [session, isLoadingSession, fetchActiveSession]);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#0B0C0D] flex items-center justify-center font-mono text-xs text-cyan-400">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>SYNCHRONIZING INCIDENT TELEMETRY...</span>
        </div>
      </div>
    );
  }

  // If no active in-progress session, route to dashboard
  if (!session || session.status !== 'IN_PROGRESS') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check sector prerequisite enforcement
  if (roomId) {
    const requestedSector = ROOM_ID_TO_SECTOR[roomId] || 1;
    const allowedSector = session.currentRoomIndex || 1;

    // Direct jumping prevention: Cannot access future rooms
    if (requestedSector > allowedSector) {
      const canonicalAllowedRoom = SECTOR_MAP[allowedSector] || 'room-01-inbox';
      return <Navigate to={`/game/room/${canonicalAllowedRoom}`} replace />;
    }
  }

  return children;
}

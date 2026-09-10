import React, { lazy, Suspense } from 'react';
import { ShieldAlert, Terminal } from 'lucide-react';
import SkeletonLoader from '../../components/feedback/SkeletonLoader';

// Lazy-loaded Room Shells
const InboxRoomShell = lazy(() => import('./room-01-inbox/InboxRoomShell'));
const VaultRoomShell = lazy(() => import('./room-02-vault/VaultRoomShell'));
const ScannerRoomShell = lazy(() => import('./room-03-scanner/ScannerRoomShell'));
const MessageRoomShell = lazy(() => import('./room-04-message/MessageRoomShell'));
const ControlRoomShell = lazy(() => import('./room-05-control/ControlRoomShell'));

const ROOM_SHELL_REGISTRY = {
  'room-01-inbox': InboxRoomShell,
  'room-02-vault': VaultRoomShell,
  'room-03-scanner': ScannerRoomShell,
  'room-04-message': MessageRoomShell,
  'room-05-control': ControlRoomShell,
};

/**
 * RoomContainer
 * Central dynamic registry loader for Sector Rooms 01–05.
 * Enforces standardized props contract and handles asynchronous module loading with Suspense.
 */
export default function RoomContainer({
  roomId,
  roomMetadata,
  challengeData,
  onDecisionSubmit,
  onRequestHint,
  isSubmitting,
}) {
  const ShellComponent = ROOM_SHELL_REGISTRY[roomId];

  if (!ShellComponent) {
    return (
      <div className="rounded border border-red-500/60 bg-red-950/40 p-8 text-center font-mono text-xs text-red-300 space-y-3">
        <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="font-bold text-sm uppercase tracking-wider">UNKNOWN SECTOR COORDINATES</h3>
        <p className="text-slate-300">
          Sector <code className="bg-red-900/60 px-1.5 py-0.5 rounded text-red-200">{roomId}</code> is not registered in the facility manifest.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<RoomLoadingSkeleton />}>
      <ShellComponent
        roomMetadata={roomMetadata}
        challengeData={challengeData}
        onDecisionSubmit={onDecisionSubmit}
        onRequestHint={onRequestHint}
        isSubmitting={isSubmitting}
      />
    </Suspense>
  );
}

function RoomLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs animate-pulse">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-lg border border-slate-800 bg-[#0d121f] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="h-4 w-48 bg-slate-800 rounded" />
            <div className="h-4 w-16 bg-slate-800 rounded" />
          </div>
          <div className="h-16 bg-slate-900/80 rounded border border-slate-800/80" />
          <div className="h-64 bg-slate-900/60 rounded border border-slate-800/60 flex items-center justify-center text-cyan-400 gap-2">
            <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="tracking-wider">DECOMPRESSING SECTOR WORKSPACE...</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-800 bg-[#0d121f] p-6 space-y-4">
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-10 bg-slate-800 rounded" />
          <div className="h-10 bg-slate-800 rounded" />
          <div className="h-10 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

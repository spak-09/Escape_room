import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Terminal } from 'lucide-react';
import TerminalButton from '../components/common/TerminalButton';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full rounded-lg border border-red-500/50 bg-[#181A1D] shadow-tactical-crimson p-8 text-center space-y-4">
        <AlertOctagon className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <h1 className="text-xl font-bold tracking-wider text-red-400 uppercase">
          404 // COORDINATES NOT FOUND
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested facility grid coordinate does not map to any recognized sector terminal or mainframe gateway.
        </p>
        <div className="pt-2">
          <Link to="/">
            <TerminalButton variant="primary" icon={Terminal} fullWidth>
              RETURN TO FACILITY HQ
            </TerminalButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

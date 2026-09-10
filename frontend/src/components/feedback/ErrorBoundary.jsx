import React, { Component } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import TerminalButton from '../common/TerminalButton';

/**
 * ErrorBoundary Component
 * Catches unhandled client-side render exceptions and mounts a diegetic facility crash recovery interface.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In a production environment, log error to remote diagnostic sink if available
    console.error('Facility Terminal Kernel Panic:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 font-mono select-none">
          <div className="w-full max-w-xl rounded-lg border-2 border-red-500/60 bg-[#0d121f] shadow-tactical-crimson p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-red-500/30 pb-4">
              <div className="w-10 h-10 rounded bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-bold text-red-300 tracking-wider uppercase">
                  KERNEL EXCEPTION // TELEMETRY LINK SEVERED
                </h1>
                <p className="text-xs text-slate-400">
                  CRITICAL RUNTIME DIAGNOSTIC // ISOLATED TERMINAL FAILURE
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="rounded border border-red-500/30 bg-red-950/20 p-4 space-y-2 text-xs">
              <p className="text-red-200 font-bold">
                {this.state.error?.message || 'An unexpected terminal rendering exception has occurred.'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Active session state remains secured on facility backend hosts. Reinitializing the terminal will attempt to restore your telemetry stream.
              </p>
            </div>

            {/* Details toggle */}
            <div>
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 focus:outline-none"
              >
                {this.state.showDetails ? 'HIDE STACK TRACE' : 'VIEW DIAGNOSTIC STACK TRACE'}
              </button>

              {this.state.showDetails && this.state.errorInfo && (
                <pre className="mt-2 p-3 bg-black/80 rounded border border-slate-800 text-[10px] text-slate-400 overflow-x-auto max-h-40 leading-relaxed font-mono">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800">
              <TerminalButton
                variant="ghost"
                size="md"
                onClick={this.handleGoHome}
                icon={Home}
              >
                RETURN TO HQ
              </TerminalButton>
              <TerminalButton
                variant="danger"
                size="md"
                onClick={this.handleReset}
                icon={RotateCcw}
              >
                REINITIALIZE TERMINAL
              </TerminalButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

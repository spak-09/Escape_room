import React, { useState, useEffect } from 'react';
import { Trophy, ShieldCheck, Clock, Award, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { formatScore, formatDuration, formatTerminalDate } from '../utils/formatters';
import TerminalCard from '../components/common/TerminalCard';
import StatusBadge from '../components/common/StatusBadge';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const query = selectedDifficulty && selectedDifficulty !== 'all'
          ? `/leaderboard?page=1&limit=50&difficulty=${selectedDifficulty}`
          : '/leaderboard?page=1&limit=50';
        const res = await api.get(query);
        setEntries(res.data?.leaderboard || []);
      } catch (err) {
        setErrorMsg(err?.message || 'Failed to retrieve verified leaderboard telemetry.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [selectedDifficulty]);

  const difficultyTabs = [
    { id: 'all', label: 'ALL TIERS' },
    { id: 'beginner', label: 'BEGINNER (5Q)' },
    { id: 'intermediate', label: 'INTERMEDIATE (15Q)' },
    { id: 'expert', label: 'EXPERT (50Q)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-mono">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>SERVER-VERIFIED ESCAPE LOGS</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100 uppercase">
          FACILITY ESCAPE LEADERBOARD
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Rankings are cryptographically audited and computed exclusively from completed facility escape runs.
        </p>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        {difficultyTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedDifficulty(tab.id)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              selectedDifficulty === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-neon-cyan/20'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="rounded border border-red-500/50 bg-red-950/40 p-4 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <TerminalCard
        title="GLOBAL VERIFIED RANKINGS"
        subtitle={`FILTER: ${selectedDifficulty.toUpperCase()} // SORTED BY NORMALIZED SCORE & TIME`}
        icon={Trophy}
        variant="cyan"
      >
        {isLoading ? (
          <div className="py-12 text-center text-xs text-cyan-400 flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>FETCHING VERIFIED FACILITY RANKINGS...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 italic">
            No verified facility escapes recorded for {selectedDifficulty.toUpperCase()} tier yet. Be the first cadet to contain all sectors and escape!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-3 px-3">RANK</th>
                  <th className="py-3 px-3">CADET CALLSIGN</th>
                  <th className="py-3 px-3">TIER</th>
                  <th className="py-3 px-3">SCORE</th>
                  <th className="py-3 px-3">DURATION</th>
                  <th className="py-3 px-3">ACCURACY</th>
                  <th className="py-3 px-3">LIVES</th>
                  <th className="py-3 px-3">BADGES</th>
                  <th className="py-3 px-3">AUDIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {entries.map((entry) => {
                  const isTopThree = entry.rank <= 3;
                  const entryDiff = entry.difficulty || 'beginner';
                  return (
                    <tr
                      key={entry.id || entry.rank}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isTopThree ? 'bg-cyan-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            entry.rank === 1
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                              : entry.rank === 2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-400/50'
                              : entry.rank === 3
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-600/50'
                              : 'text-slate-400'
                          }`}
                        >
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{entry.username || 'ANONYMOUS CADET'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          entryDiff === 'expert'
                            ? 'border-red-500/40 text-red-300 bg-red-950/30'
                            : entryDiff === 'intermediate'
                            ? 'border-amber-500/40 text-amber-300 bg-amber-950/30'
                            : 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30'
                        }`}>
                          {entryDiff}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-cyan-300 text-glow-cyan">
                        <span>{formatScore(entry.finalScore)}</span>
                        {entry.normalizedScore != null && (
                          <span className="text-emerald-400 text-[10px] ml-1 font-mono font-normal">
                            ({entry.normalizedScore}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDuration(entry.totalDurationSeconds || 0)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-emerald-400 font-bold">
                          {entry.accuracyPercentage || 100}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-red-400 font-bold">
                        {entry.livesRemaining ?? 3} / 3
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {entry.badgesEarned?.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                              title={badge}
                            >
                              {badge.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </TerminalCard>
    </div>
  );
}

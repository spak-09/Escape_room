import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Trophy,
  Play,
  Award,
  Clock,
  Heart,
  History,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { useGameSession, SECTOR_MAP } from '../hooks/useGameSession';
import { formatScore, formatDuration, formatTerminalDate } from '../utils/formatters';
import { getBadgeInfo } from '../utils/badgeDefinitions';
import { useSound } from '../hooks/useSound';
import TerminalCard from '../components/common/TerminalCard';
import TerminalButton from '../components/common/TerminalButton';
import StatusBadge from '../components/common/StatusBadge';

const TOPIC_LABELS = {
  phishing: 'Phishing Defense',
  password_security: 'Password & MFA Security',
  qr_security: 'QR / Optical Quishing',
  social_engineering: 'Social Engineering',
  multi_threat: 'Multi-Threat Containment',
};

const TOPIC_COLORS = {
  phishing: 'bg-cyan-500',
  password_security: 'bg-amber-500',
  qr_security: 'bg-emerald-500',
  social_engineering: 'bg-pink-500',
  multi_threat: 'bg-red-500',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { session } = useGameSession();
  const { playClick, playUnlock } = useSound();

  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await dashboardService.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        setErrorMsg(err?.message || 'Failed to load player career summary.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Determine active session: server dashboard summary takes precedence, fallback to GameSessionContext
  const activeSession = summary?.activeSession || (session?.status === 'IN_PROGRESS' ? session : null);

  const handleResumeEscape = () => {
    playClick();
    if (activeSession) {
      const roomIdx = activeSession.currentRoomIndex || 1;
      const targetRoomId = activeSession.currentRoomId || SECTOR_MAP[roomIdx] || 'room-01-inbox';
      navigate(`/game/room/${targetRoomId}`);
    } else {
      navigate('/facility-entry');
    }
  };

  const topicPerformance = summary?.topicPerformance || {};
  const achievements = summary?.achievements || [];
  const gameHistory = summary?.gameHistory || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 font-mono text-slate-100">
      {/* Header Profile Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-neon-cyan/20 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
                CADET {user?.username || summary?.username || 'OPERATOR'}
              </h1>
              <StatusBadge status="ACTIVE" size="sm" label="CLEARANCE VERIFIED" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              EMAIL: {user?.email || summary?.email || 'N/A'} // ROLE: {user?.role || 'PLAYER'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/facility-entry">
            <TerminalButton variant="primary" size="md" icon={Play}>
              NEW ESCAPE RUN
            </TerminalButton>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded border border-red-500/50 bg-red-950/40 p-4 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* HIGHEST PRIORITY HERO MODULE: CONTINUE ESCAPE */}
      {activeSession ? (
        <div className="relative rounded-xl border-2 border-emerald-500/80 bg-gradient-to-r from-[#0d1624] to-[#0a101d] p-6 sm:p-8 shadow-neon-emerald/20 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ACTIVE ESCAPE MISSION IN PROGRESS // PERSISTENCE SECURED</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wide">
                SECTOR 0{activeSession.currentRoomIndex || 1}:{' '}
                {SECTOR_MAP[activeSession.currentRoomIndex]?.replace('room-0', '')?.replace('-', ': ')?.toUpperCase() ||
                  'ACTIVE BULKHEAD'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Emergency facility lockdown remains engaged. Your authoritative coordinates, score, and lives are saved in facility storage.
              </p>

              {/* Progress and Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">CURRENT SCORE</span>
                  <span className="text-sm font-bold text-cyan-300">
                    {formatScore(activeSession.currentScore || 0)} PTS
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">LIVES REMAINING</span>
                  <div className="flex items-center gap-1 text-red-400 mt-1">
                    {[1, 2, 3].map((heart) => (
                      <Heart
                        key={heart}
                        className={`w-3.5 h-3.5 ${
                          heart <= (activeSession.livesRemaining ?? 3) ? 'fill-red-500' : 'opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">FACILITY ESCAPE PROGRESS</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {summary?.overallProgress || ((activeSession.currentRoomIndex - 1) / 5) * 100}%
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">ADVISORIES USED</span>
                  <span className="text-sm font-bold text-amber-300">
                    {activeSession.hintsUsedCount || 0} Hints
                  </span>
                </div>
              </div>
            </div>

            {/* High-Visibility Continue CTA */}
            <div className="flex flex-col items-stretch lg:items-end justify-center shrink-0">
              <TerminalButton
                size="lg"
                variant="emerald"
                icon={Play}
                onClick={handleResumeEscape}
                className="text-sm sm:text-base py-4 px-8 font-black shadow-neon-emerald animate-pulse-fast"
              >
                CONTINUE ESCAPE NOW
              </TerminalButton>
              <span className="text-[10px] text-slate-500 text-center lg:text-right mt-2">
                Pneumatic bulkhead ready for entry
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Standby Hero: Ready for New Escape Run */
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-[#0d1524] to-[#090d16] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-neon-cyan/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>FACILITY TELEMETRY READY // ZERO ACTIVE RUNS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 uppercase">
              READY FOR FACILITY INTRUSION CONTAINMENT
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              No escape session is currently in progress. Initiate facility access to begin a full escape playthrough across all 5 sealed bulkheads.
            </p>
          </div>

          <Link to="/facility-entry" className="shrink-0 w-full sm:w-auto">
            <TerminalButton variant="primary" size="lg" icon={Play} fullWidth>
              ENTER FACILITY SECTOR 01
            </TerminalButton>
          </Link>
        </div>
      )}

      {/* Career Overview Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <TerminalCard title="CAREER BEST SCORE" icon={Trophy} variant="cyan">
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 text-glow-cyan">
            {formatScore(summary?.bestScore || 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 uppercase">TOP VERIFIED ESCAPE RUN</p>
        </TerminalCard>

        <TerminalCard title="SUCCESSFUL ESCAPES" icon={Award} variant="emerald">
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 text-glow-emerald">
            {summary?.totalEscapes || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 uppercase">
            OUT OF {summary?.totalSessions || 0} TOTAL SESSIONS
          </p>
        </TerminalCard>

        <TerminalCard title="BADGES UNLOCKED" icon={Award} variant="amber">
          <div className="text-2xl sm:text-3xl font-black text-amber-400 text-glow-amber">
            {achievements.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 uppercase">IN CADET TROPHY SHELF</p>
        </TerminalCard>
      </div>

      {/* Topic Defense Performance Meters */}
      <TerminalCard
        title="CUMULATIVE DEFENSE TOPIC MASTERY"
        subtitle="HISTORICAL ACCURACY ACROSS THREAT VECTORS"
        icon={BarChart3}
        variant="cyan"
      >
        <div className="space-y-4 pt-1">
          {Object.keys(TOPIC_LABELS).map((topicKey) => {
            const mastery = Number(topicPerformance[topicKey]) || (summary?.totalSessions > 0 ? 100 : 0);

            return (
              <div key={topicKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{TOPIC_LABELS[topicKey]}</span>
                  <span className="font-bold text-cyan-300 text-xs">{mastery}%</span>
                </div>

                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      TOPIC_COLORS[topicKey] || 'bg-cyan-500'
                    }`}
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </TerminalCard>

      {/* Cadet Trophy Shelf / Achievements */}
      <TerminalCard
        title="CADET TROPHY SHELF & ACHIEVEMENTS"
        subtitle="AUTHORITATIVELY VERIFIED FACILITY MEDALS"
        icon={Trophy}
        variant="amber"
      >
        {achievements.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              NO ACHIEVEMENTS UNLOCKED YET
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Complete escape runs with zero mistakes, rapid solve times, and multi-threat containment to earn permanent medals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {achievements.map((item, idx) => {
              const badge = getBadgeInfo(item);
              return (
                <div
                  key={item.badgeCode || idx}
                  className="p-4 rounded-lg bg-slate-950/80 border border-amber-500/40 shadow-neon-amber/10 flex items-start gap-3 hover:border-amber-400 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-100 text-xs">{badge.title}</span>
                      <span className="text-[9px] text-amber-400 uppercase font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/40">
                        {badge.rarity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{badge.description}</p>
                    {item.earnedAt && (
                      <span className="text-[9px] text-slate-500 block pt-0.5">
                        Earned: {new Date(item.earnedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TerminalCard>

      {/* Operational Incident Logs (Game History Table) */}
      <TerminalCard
        title="OPERATIONAL INCIDENT LOGS"
        subtitle="AUDIT HISTORY OF ESCAPE RUNS // WITH INTEL REPORT ACCESS"
        icon={History}
      >
        {isLoading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading historical telemetry...</p>
        ) : gameHistory.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              NO OPERATIONAL RUNS LOGGED
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Your mission history, score records, and performance debriefs will appear here once you engage facility sectors.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">DATE / TIME</th>
                  <th className="py-3 px-3">MISSION STATUS</th>
                  <th className="py-3 px-3">SCORE</th>
                  <th className="py-3 px-3">LIVES LEFT</th>
                  <th className="py-3 px-3">DURATION</th>
                  <th className="py-3 px-3 text-right">INTELLIGENCE DEBRIEF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {gameHistory.map((run, idx) => {
                  const isCompleted = run.status === 'COMPLETED';
                  const sid = run.sessionId || run._id;

                  return (
                    <tr key={sid || idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {formatTerminalDate(run.date || run.startTime)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          status={isCompleted ? 'SECURE' : run.status === 'FAILED' ? 'DANGER' : 'WARNING'}
                          size="sm"
                          label={run.status}
                        />
                      </td>
                      <td className="py-3 px-3 font-bold text-cyan-300">
                        {formatScore(run.finalScore || run.currentScore || 0)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-red-400 font-bold">{run.livesRemaining ?? 'N/A'} / 3</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {run.durationSeconds ? formatDuration(run.durationSeconds) : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isCompleted ? (
                          <Link
                            to={`/game/escape-result/${sid}`}
                            className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/40 hover:border-cyan-400 transition-colors"
                          >
                            <span>VIEW REPORT</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : run.status === 'IN_PROGRESS' ? (
                          <button
                            type="button"
                            onClick={handleResumeEscape}
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/40 hover:border-emerald-400 transition-colors"
                          >
                            <span>RESUME</span>
                            <Play className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-600 uppercase">ARCHIVED</span>
                        )}
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

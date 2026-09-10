import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Trophy,
  Heart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  RotateCcw,
  Home,
  BarChart3,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Lock,
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { formatScore, formatDuration, formatTerminalDate } from '../utils/formatters';
import { getBadgeInfo } from '../utils/badgeDefinitions';
import { useSound } from '../hooks/useSound';
import TerminalCard from '../components/common/TerminalCard';
import TerminalButton from '../components/common/TerminalButton';
import StatusBadge from '../components/common/StatusBadge';

const TOPIC_LABELS = {
  phishing: 'Phishing Defense',
  password_security: 'Password Security & MFA',
  qr_security: 'QR Security & Quishing',
  social_engineering: 'Social Engineering Defense',
  multi_threat: 'Multi-Threat Containment',
};

const TOPIC_COLORS = {
  phishing: 'bg-cyan-500',
  password_security: 'bg-amber-500',
  qr_security: 'bg-emerald-500',
  social_engineering: 'bg-pink-500',
  multi_threat: 'bg-red-500',
};

export default function EscapeResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { playUnlock, playChime, playClick } = useSound();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  useEffect(() => {
    async function loadReport() {
      if (!sessionId) {
        setErrorMsg('No session identifier provided.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      setErrorCode(null);

      try {
        const data = await reportService.getSessionReport(sessionId);
        setReport(data);
        playUnlock();
      } catch (err) {
        setErrorMsg(err?.message || 'Failed to decrypt performance report telemetry.');
        setErrorCode(err?.code || (err?.status ? String(err.status) : null));
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [sessionId, playUnlock]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center font-mono text-xs text-cyan-400 p-4">
        <div className="text-center space-y-3">
          <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="tracking-widest uppercase text-sm font-bold text-cyan-300">
            COMPILING CYBERSECURITY PERFORMANCE REPORT...
          </p>
          <p className="text-slate-500">DECRYPTING SESSION TELEMETRY & ACHIEVEMENT MATRICES</p>
        </div>
      </div>
    );
  }

  // Error State (Incomplete session, 403 Forbidden, or 404)
  if (errorMsg || !report) {
    return (
      <div className="min-h-screen bg-[#07090f] text-slate-100 flex items-center justify-center p-4 font-mono">
        <div className="max-w-lg w-full rounded-lg border border-red-500/60 bg-[#0d121f] p-8 text-center space-y-4 shadow-neon-crimson">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto animate-pulse" />
          <div>
            <h2 className="text-base font-bold text-red-300 uppercase tracking-wider">
              {errorCode === 'REPORT_NOT_AVAILABLE'
                ? 'INCOMPLETE ESCAPE SESSION'
                : errorCode === 'FORBIDDEN_REPORT_ACCESS'
                ? 'ACCESS CLEARANCE RESTRICTED'
                : 'REPORT TELEMETRY UNAVAILABLE'}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {errorMsg}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <TerminalButton variant="ghost" onClick={() => navigate('/dashboard')} icon={Home}>
              CADET HUB
            </TerminalButton>
            <TerminalButton variant="primary" onClick={() => navigate('/facility-entry')} icon={RotateCcw}>
              NEW ESCAPE RUN
            </TerminalButton>
          </div>
        </div>
      </div>
    );
  }

  const topicMastery = report.topicMastery || report.topicScores || {};
  const badgesEarned = Array.isArray(report.badgesEarned) ? report.badgesEarned : [];

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-mono relative overflow-x-hidden">
      {/* Background Decorative Scanlines & Glow */}
      <div className="fixed inset-0 bg-emerald-950/5 pointer-events-none" />
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Declassified Intelligence Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border-2 border-emerald-500/60 bg-[#0d1522] p-6 sm:p-8 shadow-neon-emerald/20 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>FACILITY LOCKDOWN LIFTED // ESCAPE MISSION VERIFIED</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
              CYBERSECURITY INCIDENT DEBRIEF
            </h1>
            <p className="text-xs text-slate-400">
              MISSION RUN ID: <code className="text-cyan-300 font-bold">{sessionId}</code> // CLOUD KERNEL STATUS:{' '}
              <span className="text-emerald-400 font-bold">{report.status}</span>
            </p>
          </div>

          {/* Large Overall Score Badge */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-emerald-500/50 text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              AUTHORITATIVE FINAL SCORE
            </span>
            <div className="text-3xl font-black text-emerald-300 text-glow-emerald">
              {formatScore(report.finalScore || report.overallScore || 0)}
            </div>
            <span className="text-[10px] text-emerald-400/80 font-bold">
              ACCURACY: {report.accuracy ?? report.accuracyPercentage ?? 100}%
            </span>
          </div>
        </motion.div>

        {/* Primary Mission Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              FACILITY INTEGRITY
            </span>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 ${
                    heart <= (report.livesRemaining ?? 3)
                      ? 'text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                      : 'text-slate-700 opacity-40'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">
              {report.livesRemaining ?? 3} / 3 Lives Preserved
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              MISSION DURATION
            </span>
            <div className="flex items-center gap-1.5 text-base font-bold text-cyan-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{formatDuration(report.totalDurationSeconds || 0)}</span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">Total Investigation Time</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              CHALLENGES CLEARED
            </span>
            <div className="flex items-center gap-1.5 text-base font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{report.challengesCompleted ?? 5} / 5</span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">All Bulkheads Decompressed</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              TACTICAL ADVISORIES
            </span>
            <div className="flex items-center gap-2 text-base font-bold text-amber-300">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{report.hintsUsed ?? report.hintsUsedCount ?? 0} Hints</span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1">
              {report.mistakes ?? report.totalMistakes ?? 0} Unsafe Actions Logged
            </span>
          </div>
        </div>

        {/* Topic Mastery Performance Visualization */}
        <TerminalCard
          title="DEFENSE TOPIC MASTERY BREAKDOWN"
          subtitle="SERVER EVALUATED COMPETENCY GAUGES"
          icon={BarChart3}
          variant="cyan"
        >
          <div className="space-y-4 pt-1">
            {Object.keys(TOPIC_LABELS).map((topicKey) => {
              const mastery = Number(topicMastery[topicKey]) || 0;
              const isStrongest = report.strongestSkill === topicKey;
              const isWeakest = report.weakestSkill === topicKey;

              return (
                <div key={topicKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{TOPIC_LABELS[topicKey]}</span>
                      {isStrongest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                          STRONGEST ASSET
                        </span>
                      )}
                      {isWeakest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40 font-bold">
                          PRIMARY VULNERABILITY
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-cyan-300 text-xs">{mastery}%</span>
                  </div>

                  {/* Clean Horizontal Mastery Gauge */}
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      className={`h-full rounded-full ${TOPIC_COLORS[topicKey] || 'bg-cyan-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TerminalCard>

        {/* Tactical Recommendation & Competency Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strongest & Weakest Callout */}
          <TerminalCard
            title="TACTICAL COMPETENCY PROFILE"
            subtitle="STRENGTH & VULNERABILITY MAPPING"
            icon={ShieldCheck}
            variant="default"
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  PEAK DEFENSE CAPABILITY:
                </span>
                <p className="text-slate-200 font-bold">
                  {TOPIC_LABELS[report.strongestSkill] || report.strongestSkill || 'Phishing Investigation'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Demonstrated high-speed indicator discovery with zero unvetted clicks.
                </p>
              </div>

              <div className="p-3 rounded bg-amber-950/40 border border-amber-500/40 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  PRIORITY DEVELOPMENT VECTOR:
                </span>
                <p className="text-slate-200 font-bold">
                  {TOPIC_LABELS[report.weakestSkill] || report.weakestSkill || 'Multi-Threat Containment'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Logged sub-optimal triage prioritization or life deductions during containment operations.
                </p>
              </div>
            </div>
          </TerminalCard>

          {/* Actionable SOC Directive */}
          <TerminalCard
            title="SOC ACTIONABLE RECOMMENDATION"
            subtitle="AUTHORITATIVE CYBER DEFENSE PROTOCOL"
            icon={Lightbulb}
            variant="amber"
          >
            <div className="p-4 bg-slate-950/80 rounded border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
                <FileText className="w-4 h-4" />
                <span>DIRECTIVE TO MITIGATE PRIMARY VULNERABILITY:</span>
              </div>
              <blockquote className="border-l-2 border-amber-500 pl-3 italic text-slate-200 text-xs leading-relaxed">
                "{report.personalizedRecommendation || report.personalizedActionableRecommendation}"
              </blockquote>
              <p className="text-[10px] text-slate-500 pt-1">
                Integrated into cadet persistent security profile.
              </p>
            </div>
          </TerminalCard>
        </div>

        {/* Memorable Badge Reveal (Trophy Shelf) */}
        {badgesEarned.length > 0 && (
          <TerminalCard
            title="ACHIEVEMENTS UNLOCKED DURING THIS MISSION"
            subtitle="AUTHORITATIVELY AWARDED MILITARY MEDALS"
            icon={Award}
            variant="emerald"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1"
            >
              {badgesEarned.map((badgeCode, index) => {
                const badge = getBadgeInfo(badgeCode);
                return (
                  <motion.div
                    key={badge.badgeCode || index}
                    variants={{
                      hidden: { opacity: 0, scale: 0.85, y: 15 },
                      visible: { opacity: 1, scale: 1, y: 0 },
                    }}
                    className="p-4 rounded-lg bg-slate-950/80 border border-emerald-500/50 shadow-neon-emerald/20 flex items-start gap-3 relative overflow-hidden group hover:border-emerald-400 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-100 text-xs group-hover:text-emerald-300 transition-colors">
                          {badge.title}
                        </span>
                        <span className="text-[9px] text-emerald-400 uppercase font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40">
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{badge.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </TerminalCard>
        )}

        {/* Footer Navigation CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Performance report synchronized with Cadet Headquarters.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/leaderboard">
              <TerminalButton variant="ghost" size="md" icon={Trophy}>
                FACILITY LEADERBOARD
              </TerminalButton>
            </Link>

            <Link to="/dashboard">
              <TerminalButton variant="secondary" size="md" icon={Home}>
                CADET DASHBOARD
              </TerminalButton>
            </Link>

            <Link to="/facility-entry">
              <TerminalButton variant="primary" size="md" icon={RotateCcw}>
                NEW ESCAPE RUN
              </TerminalButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

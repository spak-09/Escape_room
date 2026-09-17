import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Terminal, Lock, KeyRound, QrCode, MessageSquare, ArrowRight, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import TerminalButton from '../components/common/TerminalButton';
import TerminalCard from '../components/common/TerminalCard';
import StatusBadge from '../components/common/StatusBadge';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Interactive Facility Diagnostic Preview Widget state
  const [inspectHeader, setInspectHeader] = useState(false);
  const [inspectLink, setInspectLink] = useState(false);
  const [previewOutcome, setPreviewOutcome] = useState(null);

  const rooms = [
    { number: '01', title: 'THE INBOX', icon: Terminal, topic: 'Phishing & Domain Spoofing', desc: 'Inspect sender return-paths, typo-squatted domains, and disguised hyperlinked payloads.' },
    { number: '02', title: 'THE VAULT', icon: KeyRound, topic: 'Password Entropy & MFA', desc: 'Analyze password bit-entropy, breach dictionaries, and eliminate vulnerable SMS fallbacks.' },
    { number: '03', title: 'THE SCANNER', icon: QrCode, topic: 'Quishing & QR Integrity', desc: 'Examine optical scanner viewfinder telemetry and intercept malicious redirect cascades.' },
    { number: '04', title: 'THE MESSAGE', icon: MessageSquare, topic: 'Social Engineering', desc: 'Deconstruct executive impersonation, artificial urgency, and conduct out-of-band verification.' },
    { number: '05', title: 'THE CONTROL ROOM', icon: Lock, topic: 'Multi-Threat Incident Response', desc: 'Capstone triage matrix: balance concurrent critical alarms across all attack surfaces.' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-red-500/40 bg-red-950/40 shadow-neon-crimson/20">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-red-300 tracking-wider">
              CRITICAL: FACILITY LOCKDOWN PROTOCOL ACTIVE
            </span>
          </div>

          <h1 className="font-mono text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 uppercase">
            DIGITAL SAFETY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-300">
              ESCAPE ROOM
            </span>
          </h1>

          <p className="mt-6 font-mono text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            You are trapped inside an automated cybersecurity containment facility. Automated bulkheads have sealed five sectors. Investigate authentic telemetry, uncover deceptive IoCs, execute tactical decisions, and escape.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/auth'}>
              <TerminalButton size="lg" variant="primary" icon={Terminal}>
                {isAuthenticated ? 'INITIATE FACILITY ACCESS' : 'CADET AUTHENTICATION'}
              </TerminalButton>
            </Link>
            <Link to="/leaderboard">
              <TerminalButton size="lg" variant="ghost" icon={Shield}>
                VIEW TOP ESCAPES
              </TerminalButton>
            </Link>
          </div>
        </div>

        {/* Interactive Homepage Diagnostic Widget */}
        <div className="mt-16 max-w-3xl mx-auto">
          <TerminalCard
            title="FACILITY SENSOR // TACTICAL SIMULATION PREVIEW"
            subtitle="Practice evidence inspection before entering Sector 01"
            icon={Shield}
            variant="cyan"
          >
            <div className="space-y-4 font-mono text-xs">
              <div className="rounded border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400">
                  <span>SUBJECT: URGENT WORKSTATION SYNCHRONIZATION</span>
                  <StatusBadge status="ELEVATED" size="sm" />
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>FROM: <strong className="text-slate-100">IT Facility Security</strong> &lt;support@micr0soft-update.com&gt;</span>
                    <button
                      type="button"
                      onClick={() => setInspectHeader((prev) => !prev)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{inspectHeader ? 'HIDE HEADERS' : 'INSPECT SENDER'}</span>
                    </button>
                  </div>

                  {inspectHeader && (
                    <div className="mt-2 rounded bg-slate-900 border border-cyan-500/30 p-2.5 text-[11px] text-cyan-200">
                      <p>Return-Path: &lt;bounces@shadow-c2.net&gt;</p>
                      <p className="text-amber-400 font-bold">SPF Check: FAIL (Unauthorized sending IP)</p>
                      <p className="text-amber-400 font-bold">Domain: micr0soft-update.com (Numeric 0 substituted for O)</p>
                    </div>
                  )}

                  <p className="pt-2 text-slate-300">
                    "Workstation credentials expire in 15 minutes. Synchronize security keys immediately."
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-slate-400">TARGET:</span>
                    <button
                      type="button"
                      onClick={() => setInspectLink((prev) => !prev)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{inspectLink ? 'HIDE TARGET' : 'HOVER LINK'}</span>
                    </button>
                  </div>

                  {inspectLink && (
                    <div className="mt-1 rounded bg-slate-900 border border-cyan-500/30 p-2 text-[11px] text-red-300">
                      <span>Destination URI: </span>
                      <code className="text-red-400 font-bold">http://185.220.101.4/sync-login.php</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Preview */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <TerminalButton
                  variant="emerald"
                  size="sm"
                  fullWidth
                  onClick={() => setPreviewOutcome('correct')}
                >
                  QUARANTINE & REPORT (DEFEND)
                </TerminalButton>
                <TerminalButton
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => setPreviewOutcome('wrong')}
                >
                  CLICK LINK TO SYNC (UNSAFE)
                </TerminalButton>
              </div>

              {/* Preview Feedback */}
              {previewOutcome === 'correct' && (
                <div className="mt-3 rounded border border-emerald-500/50 bg-emerald-950/40 p-3 text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="tracking-wide">THREAT NEUTRALIZED!</strong>
                    <p className="text-slate-300 mt-0.5">
                      You caught the typosquatted numeral 0 and failed SPF signature. Real escape rooms award score bonuses for deep evidence inspection.
                    </p>
                  </div>
                </div>
              )}

              {previewOutcome === 'wrong' && (
                <div className="mt-3 rounded border border-red-500/50 bg-red-950/40 p-3 text-red-300 flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="tracking-wide">FACILITY COMPROMISED (-1 LIFE)</strong>
                    <p className="text-slate-300 mt-0.5">
                      The destination was an attacker harvest portal. In the actual escape facility, incorrect actions trigger sirens, life loss, and 5-part tactical debriefs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TerminalCard>
        </div>
      </section>

      {/* 5 Sectors Overview */}
      <section className="border-t border-slate-800/80 bg-[#0B0C0D] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider uppercase">
              FACILITY ARCHITECTURE
            </span>
            <h2 className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-slate-100 uppercase">
              FIVE COMPROMISED SECTORS
            </h2>
            <p className="mt-2 font-mono text-xs text-slate-400">
              Each sector introduces authentic indicators of compromise with locked progression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const Icon = room.icon;
              return (
                <TerminalCard
                  key={room.number}
                  title={`SECTOR ${room.number}: ${room.title}`}
                  subtitle={room.topic}
                  icon={Icon}
                >
                  <p className="font-mono text-xs text-slate-400 leading-relaxed">
                    {room.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>SECURITY CLEARANCE: ENFORCED</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      <span>LOCKED</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </TerminalCard>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

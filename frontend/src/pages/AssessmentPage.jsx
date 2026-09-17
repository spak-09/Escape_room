import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sliders, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { assessmentService } from '../services/assessmentService';
import { soundEngine } from '../utils/soundEngine';
import { useToast } from '../hooks/useToast';
import TerminalButton from '../components/common/TerminalButton';
import TerminalCard from '../components/common/TerminalCard';

const TOPICS = [
  {
    key: 'phishingConfidence',
    title: '1. PHISHING & DOMAIN SPOOFING',
    desc: 'Sender verification, domain analysis, link inspection, and credential harvesting recognition.',
    labels: ['Cadet', 'Novice', 'Practitioner', 'Skilled', 'Expert Specialist'],
  },
  {
    key: 'passwordConfidence',
    title: '2. PASSWORD RESILIENCE & MFA',
    desc: 'Entropy calculation, credential reuse mitigation, password managers, and FIDO2 hardware tokens.',
    labels: ['Cadet', 'Novice', 'Practitioner', 'Skilled', 'Expert Specialist'],
  },
  {
    key: 'qrConfidence',
    title: '3. QR CODE INTEGRITY / QUISHING',
    desc: 'Decoded URL analysis, physical sticker overlay detection, and deceptive redirect chains.',
    labels: ['Cadet', 'Novice', 'Practitioner', 'Skilled', 'Expert Specialist'],
  },
  {
    key: 'socialConfidence',
    title: '4. SOCIAL ENGINEERING PRETEXTING',
    desc: 'Resistance to authority manipulation, urgent emotional pretexts, and out-of-band verification.',
    labels: ['Cadet', 'Novice', 'Practitioner', 'Skilled', 'Expert Specialist'],
  },
];

const DIFFICULTY_OPTIONS = [
  {
    id: 'beginner',
    title: 'BEGINNER',
    subtitle: 'CADET RECONNAISSANCE',
    tag: '1 Q / ROOM (5 TOTAL)',
    duration: '10-15 MIN',
    desc: 'Foundational cyber hygiene, domain typosquats, credential strength, basic quishing, urgent pretexting.',
    maxScore: '5,000 PTS',
    borderColor: 'border-cyan-500/60',
    selectedBg: 'bg-cyan-950/40',
    accentText: 'text-cyan-400',
    glowColor: 'shadow-neon-cyan/20',
  },
  {
    id: 'intermediate',
    title: 'INTERMEDIATE',
    subtitle: 'OPERATIONAL INVESTIGATION',
    tag: '3 Q / ROOM (15 TOTAL)',
    duration: '30-45 MIN',
    desc: 'AiTM reverse proxies, Kerberoasting, dynamic QR redirect chains, VIP impersonation, multi-threat containment.',
    maxScore: '15,000 PTS',
    borderColor: 'border-amber-500/60',
    selectedBg: 'bg-amber-950/40',
    accentText: 'text-amber-400',
    glowColor: 'shadow-tactical-amber/30',
  },
  {
    id: 'expert',
    title: 'EXPERT',
    subtitle: 'MASTER THREAT HUNTING',
    tag: '10 Q / ROOM (50 TOTAL)',
    duration: '90-120 MIN',
    desc: 'HTML smuggling, Golden Ticket forgery, zero-day SCADA wipes, ransomware hypervisor encryption, deepfake vishing.',
    maxScore: '50,000 PTS',
    borderColor: 'border-red-500/60',
    selectedBg: 'bg-red-950/40',
    accentText: 'text-red-400',
    glowColor: 'shadow-tactical-crimson/40',
  },
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [ratings, setRatings] = useState({
    phishingConfidence: 3,
    passwordConfidence: 3,
    qrConfidence: 3,
    socialConfidence: 3,
    tutorialRequested: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Pre-load existing assessment if already completed
  useEffect(() => {
    async function loadExisting() {
      try {
        const existing = await assessmentService.getAssessment();
        if (existing) {
          setRatings({
            phishingConfidence: existing.phishingConfidence || 3,
            passwordConfidence: existing.passwordConfidence || 3,
            qrConfidence: existing.qrConfidence || 3,
            socialConfidence: existing.socialConfidence || 3,
            tutorialRequested: Boolean(existing.tutorialRequested),
          });
        }
      } catch {}
    }
    loadExisting();
  }, []);

  const handleDifficultySelect = (diffId) => {
    soundEngine.playClick();
    setSelectedDifficulty(diffId);
    setErrorMsg(null);
  };

  const handleSliderChange = (key, value) => {
    soundEngine.playClick();
    setRatings((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDifficulty) {
      setErrorMsg('Mandatory requirement: You must explicitly select an assessment difficulty level (Beginner, Intermediate, or Expert) before entering the facility.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await assessmentService.submitAssessment(ratings);
      soundEngine.playUnlock();
      toast.success(`Clearance calibrated: ${selectedDifficulty.toUpperCase()} LEVEL`);
      navigate(`/facility-entry?difficulty=${selectedDifficulty}`);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to submit security clearance baseline assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  // Profile metric summary
  const averageConfidence = (
    (ratings.phishingConfidence +
      ratings.passwordConfidence +
      ratings.qrConfidence +
      ratings.socialConfidence) /
    4
  ).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-mono">
      <TerminalCard
        title="FACILITY SECURITY CLEARANCE ASSESSMENT"
        subtitle="ASSESSMENT DIFFICULTY SELECTION & BASELINE CALIBRATION"
        icon={Sliders}
        variant="cyan"
      >
        {/* Briefing Text */}
        <div className="mb-6 text-xs text-slate-300 bg-[#1E2023] border border-slate-800 p-4 rounded leading-relaxed space-y-1">
          <p className="font-bold text-sky-400 uppercase tracking-wide">
            MISSION ENGAGEMENT DIRECTIVE
          </p>
          <p className="text-slate-400">
            Select your assessment difficulty tier below. The facility kernel authoritatively determines the challenge bank, forensic depth, and required clearances per sector based on your selection.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* SECTION 1: DIFFICULTY SELECTION TIERS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>STEP 1: SELECT ASSESSMENT DIFFICULTY TIER</span>
              </span>
              <span className={`text-[10px] uppercase border px-2 py-0.5 rounded transition-colors ${
                selectedDifficulty
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40 font-bold'
                  : 'text-amber-400 bg-amber-950/40 border-amber-500/40 font-bold animate-pulse'
              }`}>
                {selectedDifficulty ? `SELECTED: ${selectedDifficulty.toUpperCase()}` : 'SELECTION REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIFFICULTY_OPTIONS.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;

                return (
                  <div
                    key={diff.id}
                    onClick={() => handleDifficultySelect(diff.id)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? `${diff.borderColor} ${diff.selectedBg} ${diff.glowColor}`
                        : 'border-slate-800 bg-[#121416]/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Tier Tag */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isSelected ? `${diff.borderColor} ${diff.accentText}` : 'border-slate-700 text-slate-400'
                      }`}>
                        {diff.tag}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? `${diff.borderColor} bg-slate-900` : 'border-slate-700'
                      }`}>
                        {isSelected && <div className={`w-2 h-2 rounded-full ${diff.accentText === 'text-cyan-400' ? 'bg-cyan-400' : diff.accentText === 'text-amber-400' ? 'bg-amber-400' : 'bg-red-400'}`} />}
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-sm font-black uppercase tracking-wider ${diff.accentText}`}>
                        {diff.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-0.5">
                        {diff.subtitle}
                      </p>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {diff.desc}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>EST. {diff.duration}</span>
                      <span className="font-bold text-slate-300">{diff.maxScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: TOPIC CONFIDENCE PROFILING */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>STEP 2: CALIBRATE BASELINE OPERATIONAL CONFIDENCE</span>
            </span>
          {TOPICS.map((topic) => {
            const currentVal = ratings[topic.key];
            const currentLabel = topic.labels[currentVal - 1];

            return (
              <div
                key={topic.key}
                className="p-4 rounded border border-slate-800/90 bg-[#121416] space-y-3 transition-colors hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-slate-200 tracking-wide uppercase">
                    {topic.title}
                  </h3>
                  <span className="text-sky-300 font-bold bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded text-[11px] self-start sm:self-auto">
                    LEVEL {currentVal}: {currentLabel}
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">{topic.desc}</p>

                <div className="space-y-2 pt-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={currentVal}
                    onChange={(e) => handleSliderChange(topic.key, e.target.value)}
                    aria-label={topic.title}
                    aria-valuemin="1"
                    aria-valuemax="5"
                    aria-valuenow={currentVal}
                    aria-valuetext={`Level ${currentVal}: ${currentLabel}`}
                    className="w-full accent-sky-400 cursor-pointer bg-slate-800 h-2 rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (CADET)</span>
                    <span>2 (NOVICE)</span>
                    <span>3 (PRACTITIONER)</span>
                    <span>4 (SKILLED)</span>
                    <span>5 (EXPERT)</span>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Tutorial Request Option */}
          <div className="p-4 rounded border border-sky-500/30 bg-sky-950/20 flex items-start gap-3">
            <input
              id="tutorialRequested"
              type="checkbox"
              checked={ratings.tutorialRequested}
              onChange={(e) => {
                soundEngine.playClick();
                setRatings((prev) => ({ ...prev, tutorialRequested: e.target.checked }));
              }}
              className="mt-0.5 w-4 h-4 rounded accent-sky-400 cursor-pointer bg-slate-900 border-slate-700"
            />
            <label htmlFor="tutorialRequested" className="cursor-pointer select-none">
              <span className="font-bold text-sky-300 block uppercase tracking-wide">
                REQUEST ONBOARDING PROTOCOL (RECOMMENDED FOR CADETS)
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                Enables interactive terminal spotlights highlighting headers, URL inspectors, and action consoles upon entry into Sector 01.
              </span>
            </label>
          </div>

          {/* Profile Summary Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded border border-slate-800 bg-[#0B0C0D]">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">CALIBRATED CLEARANCE PROFILE:</span>
              <span className="text-sky-300 font-bold text-xs">
                TIER: {selectedDifficulty ? selectedDifficulty.toUpperCase() : 'PENDING SELECTION (REQUIRED)'} // INDEX {averageConfidence} / 5.0 // {ratings.tutorialRequested ? 'ONBOARDING ENABLED' : 'STANDARD ENTRY'}
              </span>
            </div>

            <TerminalButton
              type="submit"
              variant={selectedDifficulty ? 'primary' : 'ghost'}
              size="lg"
              icon={ArrowRight}
              isLoading={isLoading}
              disabled={!selectedDifficulty || isLoading}
            >
              {selectedDifficulty ? 'CONFIRM & ENTER FACILITY' : 'CHOOSE DIFFICULTY LEVEL'}
            </TerminalButton>
          </div>
        </form>
      </TerminalCard>
    </div>
  );
}

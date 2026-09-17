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

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSliderChange = (key, value) => {
    soundEngine.playClick();
    setRatings((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await assessmentService.submitAssessment(ratings);
      soundEngine.playUnlock();
      toast.success('Security clearance calibrated successfully.');
      navigate('/facility-entry');
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
    <div className="max-w-3xl mx-auto px-4 py-10 font-mono">
      <TerminalCard
        title="FACILITY SECURITY CLEARANCE ASSESSMENT"
        subtitle="CALIBRATE INCIDENT RESPONSE SENSORS // BASELINE SURVEY"
        icon={Sliders}
        variant="cyan"
      >
        {/* Briefing Text */}
        <div className="mb-6 text-xs text-slate-300 bg-[#1E2023] border border-slate-800 p-4 rounded leading-relaxed space-y-1">
          <p className="font-bold text-sky-400 uppercase tracking-wide">
            PRE-ENTRY PROTOCOL NOTICE
          </p>
          <p className="text-slate-400">
            Rate your operational confidence across core defense vectors. The facility's backend adaptive engine evaluates these ratings alongside actual incident response performance to deliver contextual micro-learning when necessary.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
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
                INDEX {averageConfidence} / 5.0 // {ratings.tutorialRequested ? 'ONBOARDING ENABLED' : 'STANDARD CADET ENTRY'}
              </span>
            </div>

            <TerminalButton
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              isLoading={isLoading}
            >
              CONFIRM & ENTER FACILITY
            </TerminalButton>
          </div>
        </form>
      </TerminalCard>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, KeyRound, User, Mail, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import TerminalButton from '../components/common/TerminalButton';
import TerminalCard from '../components/common/TerminalCard';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  // Return URL after authentication
  const returnUrl = location.state?.returnUrl || '/facility-entry';

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitCooldown <= 0) return;
    const interval = setInterval(() => {
      setRateLimitCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitCooldown]);

  const validateInputs = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = 'Facility email identifier is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Invalid email syntax (must be user@domain.tld).';
    }

    if (!formData.password) {
      errors.password = 'Access passphrase is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Passphrase must be at least 8 characters.';
    }

    if (activeTab === 'register') {
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      if (!formData.username.trim()) {
        errors.username = 'Cadet callsign is required.';
      } else if (!usernameRegex.test(formData.username.trim())) {
        errors.username = 'Callsign must be 3-30 characters (letters, numbers, _ or -).';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(null);
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Password entropy analysis calculation for UI feedback
  const calculateEntropy = (password) => {
    if (!password) return { score: 0, label: 'EMPTY', color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    if (score < 40) return { score, label: 'WEAK // INSUFFICIENT ENTROPY', color: 'bg-rose-500' };
    if (score < 75) return { score, label: 'MODERATE // ACCEPTABLE', color: 'bg-amber-500' };
    return { score, label: 'STRONG // HIGH ENTROPY', color: 'bg-emerald-400' };
  };

  const entropy = calculateEntropy(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rateLimitCooldown > 0) return;

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'login') {
        const user = await login(formData.email.trim(), formData.password);
        toast.success(`Access granted. Welcome, Cadet ${user.username}.`);
      } else {
        const user = await register(formData.username.trim(), formData.email.trim(), formData.password);
        toast.success(`Enrolled. Clearance issued for Cadet ${user.username}.`);
      }
      navigate(returnUrl, { replace: true });
    } catch (err) {
      const code = err?.code || err?.error?.code;
      if (code === 'INVALID_CREDENTIALS') {
        setErrorMsg('ACCESS DENIED: Invalid email or security credentials.');
      } else if (code === 'DUPLICATE_EMAIL') {
        setErrorMsg('CONFLICT: A cadet account with this facility email already exists.');
        setFieldErrors((prev) => ({ ...prev, email: 'Email already registered.' }));
      } else if (code === 'DUPLICATE_USERNAME') {
        setErrorMsg('CONFLICT: Cadet callsign is already reserved by another agent.');
        setFieldErrors((prev) => ({ ...prev, username: 'Callsign already taken.' }));
      } else if (code === 'RATE_LIMIT_EXCEEDED' || err?.status === 429) {
        setRateLimitCooldown(15);
        setErrorMsg('THROTTLED: Rate limit exceeded. Security sensors cooling down (15s).');
      } else {
        setErrorMsg(err?.message || 'Authentication error: Unable to verify facility credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Pass for Hackathon Evaluation
  const handleQuickDemoPass = () => {
    setFormData({
      username: `Cadet_${Math.floor(1000 + Math.random() * 9000)}`,
      email: `cadet_${Date.now()}@facility.mil`,
      password: 'Password123!Secure',
    });
    setFieldErrors({});
    setErrorMsg(null);
    setActiveTab('register');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <TerminalCard
        title="FACILITY SECURITY CLEARANCE"
        subtitle="AUTHENTICATION TERMINAL // ACCESS GATE"
        icon={Shield}
        variant="cyan"
      >
        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 mb-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2.5 text-center font-bold tracking-wider uppercase transition-colors border-b-2 ${
              activeTab === 'login'
                ? 'border-sky-400 text-sky-300 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            OPERATOR LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2.5 text-center font-bold tracking-wider uppercase transition-colors border-b-2 ${
              activeTab === 'register'
                ? 'border-sky-400 text-sky-300 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            NEW CADET ENROLLMENT
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-4 rounded border border-rose-500/50 bg-rose-950/40 p-3 text-rose-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 font-mono text-xs">
          {activeTab === 'register' && (
            <div>
              <label className="block text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="username">
                CADET CALLSIGN (USERNAME)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  disabled={isLoading || rateLimitCooldown > 0}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="CadetAlpha"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border rounded focus:outline-none focus:ring-1 text-slate-100 placeholder-slate-600 transition-colors ${
                    fieldErrors.username
                      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-400'
                      : 'border-slate-700/80 focus:border-sky-400 focus:ring-sky-400'
                  }`}
                />
              </div>
              {fieldErrors.username && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.username}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="email">
              FACILITY EMAIL IDENTIFIER
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading || rateLimitCooldown > 0}
                value={formData.email}
                onChange={handleChange}
                placeholder="agent@facility.mil"
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border rounded focus:outline-none focus:ring-1 text-slate-100 placeholder-slate-600 transition-colors ${
                  fieldErrors.email
                    ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-400'
                    : 'border-slate-700/80 focus:border-sky-400 focus:ring-sky-400'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-400 uppercase tracking-wider mb-1.5" htmlFor="password">
              SECURITY ACCESS PASSPHRASE
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading || rateLimitCooldown > 0}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border rounded focus:outline-none focus:ring-1 text-slate-100 placeholder-slate-600 transition-colors ${
                  fieldErrors.password
                    ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-400'
                    : 'border-slate-700/80 focus:border-sky-400 focus:ring-sky-400'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.password}</p>
            )}

            {/* Entropy Analysis Bar for Register Tab */}
            {activeTab === 'register' && formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>ENTROPY RATING:</span>
                  <span className="font-bold">{entropy.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${entropy.color}`}
                    style={{ width: `${entropy.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <TerminalButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={rateLimitCooldown > 0}
              isLoading={isLoading}
            >
              {rateLimitCooldown > 0
                ? `COOLDOWN ACTIVE (${rateLimitCooldown}S)`
                : activeTab === 'login'
                ? 'VERIFY CREDENTIALS'
                : 'INITIALIZE CLEARANCE'}
            </TerminalButton>
          </div>
        </form>

        {/* Quick Demo Mode for Hackathon */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleQuickDemoPass}
            className="w-full py-2 px-3 rounded border border-sky-500/30 bg-sky-950/20 hover:bg-sky-900/30 text-sky-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>[ GUEST RECON PASS: AUTO-GENERATE CADET ]</span>
          </button>
          <p className="mt-2 text-[10px] font-mono text-slate-500 text-center">
            Generates compliant test credentials with bcrypt cost 12 hashing.
          </p>
        </div>
      </TerminalCard>
    </div>
  );
}

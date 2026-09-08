import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, User, Mail, Lock, AlertTriangle, Activity, Wifi, CheckCircle2 } from 'lucide-react';
import { SecurityEnvironmentBackground } from '../components/common/SecurityEnvironmentBackground';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const validatePassword = (pwd: string) => {
    return pwd.length >= 8;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      addToast('Password must be at least 8 characters', 'error');
      setIsLoading(false);
      return;
    }

    try {
      await signup({ name, email, password });
      addToast('Analyst account registered successfully. Authenticate to proceed.', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'Minimum 8 characters', met: password.length >= 8 },
    { label: 'Uppercase & Lowercase letters', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Numeric digits (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special character symbol', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030508] text-gray-100 overflow-hidden relative p-4">
      <SecurityEnvironmentBackground profile="auth" intensity="moderate" />

      <div className="relative z-10 flex w-full max-w-4xl bg-[#080D14]/90 border border-[#151D28] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Left panel - Info */}
        <div className="hidden lg:flex w-1/2 p-10 bg-gradient-to-br from-[#080D14] via-[#0B111A] to-[#080D14] border-r border-[#151D28] flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded border border-cyan-500/30 bg-cyan-950/40 p-2.5 text-cyan-400">
                <Shield size={22} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-widest text-white uppercase font-mono">EMAIL THREAT</h1>
                <p className="text-[9px] font-bold tracking-[0.2em] text-cyan-500 uppercase font-mono">FORENSIC SUITE</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">Operator Enrolment</h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Provision an authorized forensic analyst workspace with access to deep header telemetry, MITRE ATT&CK correlation, and real-time threat intelligence.
            </p>

            <div className="space-y-3">
              <Feature icon={<Activity size={14} />} title="Deterministic Analysis" desc="Rule-based header forensics, hop validation, and divergence telemetry" />
              <Feature icon={<Wifi size={14} />} title="IOC Workbench" desc="Automated extraction and categorization of network and file indicators" />
              <Feature icon={<Shield size={14} />} title="Export & SIEM Integration" desc="STIX 2.1 bundles, Splunk/KQL detection rules, and blocklists" />
            </div>
          </div>

          <div className="pt-6 border-t border-[#151D28]">
            <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
              All analyst actions are logged to immutable audit streams for compliance and forensic integrity.
            </p>
          </div>
        </div>

        {/* Right panel - Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-[#080D14]/60">
          <div className="max-w-sm mx-auto w-full">
            <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
              <div className="rounded border border-cyan-500/30 bg-cyan-950/30 p-2 text-cyan-400">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wide text-white">EMAIL THREAT</h1>
                <p className="text-[9px] font-bold tracking-[0.2em] text-cyan-500">INTELLIGENCE</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-500 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/30">
                NEW ANALYST
              </span>
              <h2 className="text-xl font-bold text-white mt-2">Create Workspace</h2>
              <p className="text-xs text-gray-500 mt-1">Configure your forensic operator credentials</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Full Name / Call-sign</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-600" size={15} />
                  <input
                    type="text"
                    placeholder="Analyst Name"
                    className="soc-input pl-10 text-xs py-2 font-mono"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-600" size={15} />
                  <input
                    type="email"
                    placeholder="analyst@domain.corp"
                    className="soc-input pl-10 text-xs py-2 font-mono"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-600" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    className="soc-input pl-10 text-xs py-2 font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {password && (
                <div className="bg-[#05080D] border border-[#151D28] rounded p-2.5 text-[11px] space-y-1.5 font-mono">
                  <p className="text-gray-400 font-semibold text-[10px] uppercase">Entropy Check</p>
                  <div className="grid grid-cols-2 gap-1">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className={`flex items-center gap-1.5 ${req.met ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {req.met ? <CheckCircle2 size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />}
                        <span className="text-[10px] truncate">{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-600" size={15} />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className="soc-input pl-10 text-xs py-2 font-mono"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
                  <AlertTriangle size={13} />
                  <span>Passwords do not match</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !validatePassword(password)}
                className={`btn-primary w-full py-2.5 mt-2 shadow-lg shadow-cyan-950/30 ${isLoading || !validatePassword(password) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span className="font-mono text-xs">ENROLLING OPERATOR...</span>
                  </>
                ) : (
                  <>
                    <Shield size={15} />
                    <span className="font-mono text-xs">REGISTER ANALYST ACCOUNT</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-500">
              Already authorized?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in to console
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-2.5 rounded border border-[#151D28] bg-[#05080D]/60">
      <div className="text-cyan-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-white font-mono">{title}</p>
        <p className="text-[11px] text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

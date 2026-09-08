import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertTriangle, Shield, Activity, Globe, Server, Wifi } from 'lucide-react';
import { SecurityEnvironmentBackground } from '../components/common/SecurityEnvironmentBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or connection error');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Single Sign-On is not configured on this instance.');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030508] text-gray-100 overflow-hidden relative p-4">
      <SecurityEnvironmentBackground profile="auth" intensity="moderate" />

      <div className="relative z-10 flex w-full max-w-5xl bg-[#080D14]/90 border border-[#151D28] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Left panel - Security atmosphere */}
        <div className="hidden lg:flex w-1/2 p-12 bg-gradient-to-br from-[#080D14] via-[#0B111A] to-[#080D14] border-r border-[#151D28] flex-col relative justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded border border-cyan-500/30 bg-cyan-950/40 p-3 text-cyan-400 shadow-lg shadow-cyan-950/50">
                <Shield size={26} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-widest text-white uppercase font-mono">EMAIL THREAT</h1>
                <p className="text-[9px] font-bold tracking-[0.25em] text-cyan-500 uppercase font-mono">FORENSIC INTELLIGENCE</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">Enterprise Defense & Forensic Lab</h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-8">
              Production-grade digital forensics engine for email threat analysis, header validation, behavioral heuristics, and MITRE ATT&CK campaign mapping.
            </p>

            <div className="space-y-3">
              <ServiceStatus icon={<Activity size={14} />} name="Forensic Parser Engine" status="Operational" />
              <ServiceStatus icon={<Wifi size={14} />} name="Threat Intelligence Feeds" status="Connected" />
              <ServiceStatus icon={<Globe size={14} />} name="Global Telemetry Node" status="Live" />
              <ServiceStatus icon={<Server size={14} />} name="SSRF & Guard Sandbox" status="Secured" />
            </div>
          </div>

          <div className="pt-8 border-t border-[#151D28]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">Verification Standards</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#05080D]/80 p-2.5 rounded border border-[#151D28]">
                <p className="text-base font-bold text-cyan-400 font-mono">RFC 5322</p>
                <p className="text-[9px] text-gray-500">Spec Compliant</p>
              </div>
              <div className="bg-[#05080D]/80 p-2.5 rounded border border-[#151D28]">
                <p className="text-base font-bold text-emerald-400 font-mono">STIX 2.1</p>
                <p className="text-[9px] text-gray-500">Threat Bundles</p>
              </div>
              <div className="bg-[#05080D]/80 p-2.5 rounded border border-[#151D28]">
                <p className="text-base font-bold text-violet-400 font-mono">ATT&CK</p>
                <p className="text-[9px] text-gray-500">v14 Mapped</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Authentication */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#080D14]/60">
          <div className="max-w-sm mx-auto w-full">
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
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
                SECURE AUTHENTICATION
              </span>
              <h2 className="text-xl font-bold text-white mt-2">Sign in to Console</h2>
              <p className="text-xs text-gray-500 mt-1">Authenticate with authorized SOC credentials</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded border border-red-800/50 bg-red-950/30 flex items-start gap-3">
                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={15} />
                <p className="text-xs text-red-300 font-mono leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Operator ID / Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-600" size={15} />
                  <input
                    type="email"
                    placeholder="analyst@soc.domain"
                    className="soc-input pl-10 text-xs py-2.5 font-mono"
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Access Key / Password</label>
                  <span className="text-[10px] text-gray-600 font-mono">ENCRYPTED</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-600" size={15} />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="soc-input pl-10 text-xs py-2.5 font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5 mt-2 transition-all shadow-lg shadow-cyan-950/30"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span className="font-mono text-xs">AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={15} />
                    <span className="font-mono text-xs">AUTHENTICATE OPERATOR</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-[#151D28]" />
              <span className="text-[9px] text-gray-600 font-mono uppercase tracking-wider">FEDERATED ACCESS</span>
              <div className="flex-1 border-t border-[#151D28]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 rounded border border-[#263449] bg-[#05080D] text-gray-300 text-xs font-mono font-medium flex items-center justify-center gap-2 hover:border-cyan-500/50 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Enterprise SSO via Google
            </button>

            <p className="mt-8 text-center text-xs text-gray-500">
              Need forensic operator credentials?{' '}
              <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Request analyst account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-mono">
        SECURE INVESTIGATION NODE • LOCAL INSTANCE
      </div>
    </div>
  );
}

function ServiceStatus({ icon, name, status }: { icon: React.ReactNode; name: string; status: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded bg-[#05080D]/60 border border-[#151D28]/60">
      <div className="flex items-center gap-2.5">
        <div className="text-cyan-400">
          {icon}
        </div>
        <span className="text-xs text-gray-300 font-mono">{name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">{status}</span>
      </div>
    </div>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { Activity, ArrowUpRight, Check, Fingerprint, Globe2, KeyRound, LockKeyhole, LogIn, Mail, Network, Shield, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SecurityEnvironmentBackground } from '../components/common/SecurityEnvironmentBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/');
  }, [user, navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (reason: any) {
      setError(reason.message || 'Invalid credentials or connection error');
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
    <main className="relative min-h-screen overflow-hidden bg-transparent text-[#d6e1de]">
      <SecurityEnvironmentBackground profile="auth" intensity="moderate" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#29454b] pb-5">
          <Link to="/login" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3b5e60] bg-[#142b2d] text-[#58d6c0] shadow-[0_0_25px_rgba(88,214,192,0.12)] transition-transform group-hover:-rotate-6"><Shield size={19} /></span>
            <span><strong className="block text-sm tracking-[0.12em] text-white">EMAIL THREAT</strong><span className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-[#58d6c0]">Forensic intelligence</span></span>
          </Link>
          <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#718581] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#58d6c0] shadow-[0_0_10px_rgba(88,214,192,0.8)]" /> local analysis node <span className="text-[#3b5e60]">/</span> secure access</div>
        </header>

        <div className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1fr_460px] lg:gap-24 lg:py-16">
          <section className="max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#58d6c0]">Evidence before assumption</p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl">See the message behind the verdict.</h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#9aadaa]">A focused workspace for tracing email identity, transport, authentication, and threat intelligence back to the original message.</p>
            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3"><Capability icon={<Network size={16} />} label="Mail flow" detail="Received-chain reconstruction" /><Capability icon={<Fingerprint size={16} />} label="Identity" detail="SPF · DKIM · DMARC" /><Capability icon={<Globe2 size={16} />} label="Intel" detail="Provider-aware enrichment" /></div>
            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#29454b] pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#718581]"><span className="inline-flex items-center gap-2"><Check size={13} className="text-[#58d6c0]" /> RFC 5322 parsing</span><span className="inline-flex items-center gap-2"><Check size={13} className="text-[#58d6c0]" /> STIX 2.1 export</span><span className="inline-flex items-center gap-2"><Check size={13} className="text-[#58d6c0]" /> ATT&amp;CK context</span></div>
          </section>

          <section className="relative rounded-2xl border border-[#3b5e60] bg-[#0c171c]/90 p-6 shadow-[0_28px_90px_rgba(2,12,15,0.42)] backdrop-blur-xl sm:p-8">
            <div className="absolute right-0 top-0 h-28 w-28 overflow-hidden rounded-bl-[5rem] bg-[#58d6c0]/[0.05]" />
            <div className="relative">
              <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#58d6c0]">Analyst gateway</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Sign in to console</h2></div><div className="rounded-lg border border-[#29454b] bg-[#142b2d] p-3 text-[#58d6c0]"><LockKeyhole size={18} /></div></div>
              <p className="mt-3 text-sm leading-6 text-[#9aadaa]">Use your authorized operator credentials to open the investigation workspace.</p>
              {error && <div className="mt-6 rounded-lg border border-[#8e4c48] bg-[#3b2424]/60 p-3 text-xs leading-5 text-[#f2aaa2]">{error}</div>}
              <form onSubmit={handleLogin} className="mt-7 space-y-5"><Field label="Operator email" icon={<Mail size={16} />} value={email} onChange={setEmail} placeholder="analyst@soc.domain" type="email" disabled={isLoading} /><Field label="Access key" icon={<KeyRound size={16} />} value={password} onChange={setPassword} placeholder="Enter access key" type="password" disabled={isLoading} /><button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#58d6c0] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#09201e] shadow-[0_12px_28px_rgba(88,214,192,0.16)] transition hover:bg-[#82e5d2] disabled:cursor-wait disabled:opacity-60">{isLoading ? <><Activity size={15} className="animate-pulse" /> Verifying access</> : <><LogIn size={15} /> Authenticate operator</>}</button></form>
              <div className="my-7 flex items-center gap-3"><span className="h-px flex-1 bg-[#29454b]" /><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#718581]">Federated identity</span><span className="h-px flex-1 bg-[#29454b]" /></div>
              <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#3b5e60] bg-[#101f24] px-4 py-3 text-xs font-medium text-[#d6e1de] transition hover:border-[#58d6c0] hover:bg-[#142b2d] disabled:opacity-60"><GoogleMark /> Continue with Google SSO <ArrowUpRight size={13} className="text-[#718581]" /></button>
              <p className="mt-7 text-center text-xs text-[#718581]">Need an operator account? <Link to="/signup" className="font-medium text-[#58d6c0] hover:text-[#9cefe1]">Request access</Link></p>
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-2 border-t border-[#29454b] pt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-[#516963] sm:flex-row sm:items-center sm:justify-between"><span>Protected investigation surface</span><span className="inline-flex items-center gap-2"><UserRound size={11} /> Authorized personnel only · local instance</span></footer>
      </div>
    </main>
  );
}

function Field({ label, icon, value, onChange, placeholder, type, disabled }: { label: string; icon: ReactNode; value: string; onChange: (value: string) => void; placeholder: string; type: string; disabled: boolean }) {
  return <label className="block"><span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9aadaa]">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-3.5 top-3.5 text-[#718581]">{icon}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required disabled={disabled} autoComplete={type === 'email' ? 'email' : 'current-password'} className="w-full rounded-lg border border-[#29454b] bg-[#081216] py-3.5 pl-11 pr-4 text-sm text-[#eef8f4] placeholder:text-[#516963] transition focus:border-[#58d6c0] focus:outline-none focus:ring-2 focus:ring-[#58d6c0]/10 disabled:opacity-60" /></span></label>;
}

function Capability({ icon, label, detail }: { icon: ReactNode; label: string; detail: string }) { return <div className="rounded-lg border border-[#29454b] bg-[#101f24]/65 p-4"><div className="text-[#58d6c0]">{icon}</div><p className="mt-5 text-sm font-medium text-[#d6e1de]">{label}</p><p className="mt-1 text-[11px] leading-5 text-[#718581]">{detail}</p></div>; }
function GoogleMark() { return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-bold text-[11px] text-[#4285f4]">G</span>; }
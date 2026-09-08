import { useState, type ReactNode } from 'react';
import { Activity, AlertTriangle, ArrowLeft, ArrowUpRight, CheckCircle2, Fingerprint, KeyRound, LockKeyhole, Mail, Network, Shield, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SecurityEnvironmentBackground } from '../components/common/SecurityEnvironmentBackground';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const requirements = [
    ['8+ characters', password.length >= 8],
    ['Upper + lowercase', /[A-Z]/.test(password) && /[a-z]/.test(password)],
    ['Numeric digit', /[0-9]/.test(password)],
    ['Special symbol', /[^A-Za-z0-9]/.test(password)],
  ] as const;

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      setIsLoading(false);
      return;
    }
    try {
      await signup({ name, email, password });
      addToast('Analyst account registered successfully. Authenticate to proceed.', 'success');
      navigate('/login');
    } catch (reason: any) {
      addToast(reason.message || 'Registration failed', 'error');
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-[#d6e1de]">
      <SecurityEnvironmentBackground profile="auth" intensity="moderate" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#29454b] pb-5">
          <Link to="/login" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3b5e60] bg-[#142b2d] text-[#58d6c0]"><Shield size={19} /></span>
            <span><strong className="block text-sm tracking-[0.12em] text-white">EMAIL THREAT</strong><span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#58d6c0]">Forensic intelligence</span></span>
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#718581] hover:text-[#58d6c0]"><ArrowLeft size={13} /> Back to secure access</Link>
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1fr_500px] lg:gap-24">
          <section className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#58d6c0]">Controlled access provisioning</p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl">Build your analyst identity.</h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#9aadaa]">Create an operator profile for investigations that need a clear chain from message evidence to defensible decisions.</p>
            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3"><Capability icon={<Network size={16} />} label="Casework" detail="Persisted investigations" /><Capability icon={<Fingerprint size={16} />} label="Evidence" detail="Traceable findings" /><Capability icon={<KeyRound size={16} />} label="Access" detail="Role-based controls" /></div>
            <div className="mt-12 rounded-xl border border-[#29454b] bg-[#101f24]/70 p-5"><div className="flex items-start gap-3"><LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#58d6c0]" /><div><p className="text-sm font-medium text-[#d6e1de]">Every action stays attributable.</p><p className="mt-1 text-xs leading-6 text-[#718581]">Operator activity is associated with your account for auditability and forensic integrity.</p></div></div></div>
          </section>

          <section className="rounded-2xl border border-[#3b5e60] bg-[#0c171c]/90 p-6 shadow-[0_28px_90px_rgba(2,12,15,0.42)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#58d6c0]">Analyst gateway</p><h2 className="mt-3 text-2xl font-semibold text-white">Request access</h2></div><div className="rounded-lg border border-[#29454b] bg-[#142b2d] p-3 text-[#58d6c0]"><UserRound size={18} /></div></div>
            <p className="mt-3 text-sm leading-6 text-[#9aadaa]">Provision your operator credentials. An administrator may review access according to local policy.</p>
            <form onSubmit={handleSignup} className="mt-7 space-y-5">
              <Field label="Full name / call-sign" icon={<UserRound size={16} />} value={name} onChange={setName} placeholder="Analyst name" type="text" disabled={isLoading} />
              <Field label="Work email" icon={<Mail size={16} />} value={email} onChange={setEmail} placeholder="analyst@domain.corp" type="email" disabled={isLoading} />
              <div><div className="mb-2 flex items-center justify-between"><label className="field-label">Access key</label><button type="button" onClick={() => setShowPassword(!showPassword)} className="font-mono text-[10px] uppercase text-[#58d6c0]">{showPassword ? 'Hide' : 'Show'}</button></div><Field icon={<KeyRound size={16} />} value={password} onChange={setPassword} placeholder="Create access key" type={showPassword ? 'text' : 'password'} disabled={isLoading} />{password && <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-[#29454b] bg-[#081216] p-3">{requirements.map(([label, met]) => <div key={label} className={`flex items-center gap-2 text-[10px] ${met ? 'text-emerald-300' : 'text-[#718581]'}`}>{met ? <CheckCircle2 size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-[#516963]" />}{label}</div>)}</div>}</div>
              <Field label="Confirm access key" icon={<KeyRound size={16} />} value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat access key" type="password" disabled={isLoading} />
              {password && confirmPassword && password !== confirmPassword && <p className="flex items-center gap-2 font-mono text-xs text-[#f2aaa2]"><AlertTriangle size={13} /> Access keys do not match</p>}
              <button type="submit" disabled={isLoading || password.length < 8} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#58d6c0] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#09201e] transition hover:bg-[#82e5d2] disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? <><Activity size={15} className="animate-pulse" /> Provisioning operator</> : <><Shield size={15} /> Create analyst account</>}</button>
            </form>
            <div className="my-7 flex items-center gap-3"><span className="h-px flex-1 bg-[#29454b]" /><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#718581]">Existing operator</span><span className="h-px flex-1 bg-[#29454b]" /></div>
            <Link to="/login" className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#3b5e60] bg-[#101f24] px-4 py-3 text-xs font-medium text-[#d6e1de] hover:border-[#58d6c0]">Sign in to console <ArrowUpRight size={13} /></Link>
          </section>
        </div>
        <footer className="flex justify-between border-t border-[#29454b] pt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-[#516963]"><span>Protected investigation surface</span><span className="inline-flex items-center gap-2"><UserRound size={11} /> Authorized personnel only</span></footer>
      </div>
    </main>
  );
}

function Field({ label, icon, value, onChange, placeholder, type, disabled }: { label?: string; icon: ReactNode; value: string; onChange: (value: string) => void; placeholder: string; type: string; disabled: boolean }) { return <label className="block">{label && <span className="field-label">{label}</span>}<span className="relative block"><span className="pointer-events-none absolute left-3.5 top-3.5 text-[#718581]">{icon}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required disabled={disabled} autoComplete={type === 'email' ? 'email' : type === 'password' ? 'new-password' : undefined} className="w-full rounded-lg border border-[#29454b] bg-[#081216] py-3.5 pl-11 pr-4 text-sm text-[#eef8f4] placeholder:text-[#516963] focus:border-[#58d6c0] focus:outline-none" /></span></label>; }
function Capability({ icon, label, detail }: { icon: ReactNode; label: string; detail: string }) { return <div className="rounded-lg border border-[#29454b] bg-[#101f24]/65 p-4"><div className="text-[#58d6c0]">{icon}</div><p className="mt-5 text-sm font-medium text-[#d6e1de]">{label}</p><p className="mt-1 text-[11px] leading-5 text-[#718581]">{detail}</p></div>; }

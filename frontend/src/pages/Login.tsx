import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLogin } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Shield, Cpu, Database, Activity, Wifi, Server, Key, Check, AlertTriangle, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await mockLogin(email, password);

    if (result) {
      login(result.user);
      setTimeout(() => {
        setIsLoading(false);
        if (result.user.role === 'admin') navigate('/admin');
        else navigate('/');
      }, 800);
    } else {
      setIsLoading(false);
      setError('Invalid email or password. Please check your credentials.');
    }
  };

  const useDemoUser = () => {
    setEmail('analyst@demo.local');
    setPassword('demo123');
    setError('');
  };

  const useDemoAdmin = () => {
    setEmail('admin@demo.local');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#05080D] text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Fine Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 12, 24, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 12, 24, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)'
        }} />

        {/* Radial Lighting */}
        <div className="absolute inset-0 bg-gradient-radial from-cyan-900/5 via-transparent to-transparent" />

        {/* Circuit Traces */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <path
              key={i}
              d={`M ${10 + i * 12}% 10 L ${15 + i * 12}% 90`}
              stroke="url(#circuit-gradient)"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </svg>

        {/* Network Nodes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Visual Area */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
          {/* Cybersecurity Shield Core */}
          <div className="relative mx-auto w-64 h-64 lg:w-96 lg:h-96">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full animate-spin-slow" style={{ animationDuration: '40s' }} />
            <div className="absolute inset-8 border-2 border-blue-400/30 rounded-full animate-spin-slow-reverse" style={{ animationDuration: '30s' }} />

            {/* Shield Center */}
            <div className="absolute inset-16 flex items-center justify-center">
              <div className="relative">
                <Shield className="w-32 h-32 lg:w-48 lg:h-48 text-cyan-400/60" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Key className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Scanning Arcs */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
              <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />
            </div>
          </div>

          {/* Security Labels */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: <Shield size={16} />, label: 'THREAT INTELLIGENCE' },
              { icon: <Mail size={16} />, label: 'EMAIL ANALYSIS' },
              { icon: <Activity size={16} />, label: 'IOC ENGINE' },
              { icon: <Cpu size={16} />, label: 'HEADER ANALYSIS' },
              { icon: <Database size={16} />, label: 'URL REPUTATION' },
              { icon: <Server size={16} />, label: 'RISK ENGINE' },
              { icon: <Key size={16} />, label: 'SPF / DKIM / DMARC' },
              { icon: <Wifi size={16} />, label: 'SECURITY CORE' },
              { icon: <Check size={16} />, label: 'SYSTEM ONLINE' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 bg-[#0B111A]/50 backdrop-blur-sm rounded border border-[#151D28]"
              >
                <div className="text-cyan-400">{item.icon}</div>
                <span className="text-xs font-bold text-gray-300 tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Branding */}
          <div className="mt-12 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              EMAIL THREAT INTELLIGENCE
            </h1>
            <p className="text-lg lg:text-xl text-gray-400 mt-2 tracking-wider">
              SECURITY OPERATIONS CENTER
            </p>
            <p className="text-sm text-gray-500 mt-4">
              EMAIL SECURITY • THREAT DETECTION • INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-[#080D14]/80 backdrop-blur-sm border-l border-[#151D28]">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">SIGN IN</h2>
              <p className="text-gray-400">
                Access the Email Threat Intelligence Security Operations Center
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={20} />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full bg-[#05080D] border border-[#151D28] text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-cyan-500 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full bg-[#05080D] border border-[#151D28] text-white pl-10 pr-12 py-3 rounded focus:outline-none focus:border-cyan-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#05080D] border-[#151D28] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-400">Remember this session</span>
                </label>
                <button
                  type="button"
                  onClick={() => addToast('Password reset functionality not available in demo', 'info')}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-bold"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    SIGN IN
                  </>
                )}
              </button>
            </form>

            {/* Demo Access */}
            <div className="mt-8 pt-8 border-t border-[#151D28]">
              <p className="text-sm text-gray-500 mb-4">DEMO ACCESS • Frontend Prototype</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={useDemoUser}
                  disabled={isLoading}
                  className="p-3 bg-[#0B111A] border border-[#151D28] rounded hover:bg-[#101722] transition-colors text-left disabled:opacity-50"
                >
                  <div className="text-xs text-gray-400 mb-1">USER ROLE</div>
                  <div className="font-mono text-sm text-white">analyst@demo.local</div>
                  <div className="font-mono text-xs text-gray-400">demo123</div>
                </button>
                <button
                  onClick={useDemoAdmin}
                  disabled={isLoading}
                  className="p-3 bg-[#0B111A] border border-[#151D28] rounded hover:bg-[#101722] transition-colors text-left disabled:opacity-50"
                >
                  <div className="text-xs text-gray-400 mb-1">ADMINISTRATOR</div>
                  <div className="font-mono text-sm text-cyan-300">admin@demo.local</div>
                  <div className="font-mono text-xs text-gray-400">admin123</div>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">These buttons populate the form above</p>
            </div>

            {/* Signup Link */}
            <div className="mt-8 pt-8 border-t border-[#151D28] text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <a
                  href="/signup"
                  className="text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  Create account
                </a>
              </p>
            </div>

            {/* Security Status */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400">SECURE AUTHENTICATION CHANNEL • SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse linear infinite;
        }
        .bg-gradient-radial {
          background-image: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}

// Helper function to show toast (add to context later)
const addToast = (message: string, type: string = 'info') => {
  console.log(`[DEMO] ${type.toUpperCase()}: ${message}`);
};

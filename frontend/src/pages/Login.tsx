import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertTriangle } from 'lucide-react';

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
      setError(err.message || 'Invalid email or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="flex w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
        <div className="w-1/2 p-12 bg-gray-900 border-r border-gray-800 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">Email Threat Intelligence</h1>
          <p className="text-gray-400">Security Operations Center</p>
        </div>
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-8">Sign In</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={20} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 pl-10 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 pl-10 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? 'AUTHENTICATING...' : (
                <>
                  <LogIn size={20} />
                  SIGN IN
                </>
              )}
            </button>
          </form>
          <div className="mt-8 text-center text-gray-400">
            Don't have an account? <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold">Create account</a>
          </div>
        </div>
      </div>
    </div>
  );
}

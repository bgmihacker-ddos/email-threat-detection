import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLogin } from '../services/authApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await mockLogin(email, password);
    if (result) {
      login(result.user);
      if (result.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setError('Invalid credentials');
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
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full p-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-700">
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

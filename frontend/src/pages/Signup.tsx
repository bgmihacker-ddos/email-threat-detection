import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup({ name, email, password });
      addToast('Account created successfully. Please login.', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05080D] text-white">
      <form onSubmit={handleSignup} className="w-96 bg-[#080D14] p-8 rounded border border-[#151D28]">
        <h2 className="text-xl font-bold mb-6 uppercase tracking-wider text-cyan-400">Create Account</h2>
        <input type="text" placeholder="Full Name" className="w-full p-2 mb-4 bg-[#0B111A] border border-[#151D28] rounded" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
        <input type="email" placeholder="Email" className="w-full p-2 mb-4 bg-[#0B111A] border border-[#151D28] rounded" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        <input type="password" placeholder="Password" className="w-full p-2 mb-6 bg-[#0B111A] border border-[#151D28] rounded" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
        <button type="submit" className="w-full p-2 bg-cyan-600 rounded font-bold text-xs uppercase hover:bg-cyan-700 disabled:opacity-50" disabled={isLoading}>
          {isLoading ? 'CREATING...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

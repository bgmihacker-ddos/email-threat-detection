import { Bell, User, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function TopBar() {
  const { user } = useAuth();
  return (
    <header className="h-14 bg-[#080D14] border-b border-[#151D28] flex items-center justify-between px-6">
      <h2 className="text-sm font-bold text-white tracking-widest uppercase">Dashboard</h2>

      <div className="flex items-center gap-6">
        <div className="relative">
            <Search className="absolute left-2 top-2 text-gray-600" size={14} />
            <input type="text" placeholder="Search..." className="bg-[#05080D] border border-[#151D28] text-gray-300 text-xs py-1.5 pl-8 pr-4 rounded w-64 focus:outline-none focus:border-cyan-800" />
        </div>
        <div className="flex items-center gap-2 text-[10px] bg-[#0E1520] border border-[#151D28] px-3 py-1 rounded">
            <span className="text-gray-500 font-bold">THREAT ENGINE:</span>
            <span className="text-cyan-400 uppercase">DEMO</span>
        </div>
        <button className="text-gray-400 hover:text-cyan-400 transition-colors">
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-2 text-gray-400">
          <User size={16} />
          <div className="text-xs">
            <p className="text-white font-bold">{user?.name || 'Guest'}</p>
            <p className="text-[9px] uppercase tracking-widest text-cyan-500">{user?.role === 'admin' ? 'ADMINISTRATOR' : 'USER'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

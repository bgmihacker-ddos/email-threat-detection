import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Mail, ShieldAlert, History, Settings, Globe, BarChart3,
  LogOut, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#05080D] text-gray-100 antialiased">
      <UserSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Reuse TopBar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function UserSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#080D14] border-r border-[#151D28] flex flex-col">
      <div className="p-6 border-b border-[#151D28]">
        <h1 className="text-xl font-bold text-cyan-400">EMAIL THREAT</h1>
        <p className="text-xs text-gray-500">INTELLIGENCE</p>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">Overview</p>
          <NavItem to="/" icon={LayoutDashboard} name="Dashboard" />
          <NavItem to="/analyze" icon={Mail} name="Analyze Email" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">Threat Intelligence</p>
          <NavItem to="/live-threat" icon={Globe} name="Live Threat" />
          <NavItem to="/threats" icon={ShieldAlert} name="Threats" />
          <NavItem to="/indicators" icon={Activity} name="Indicators" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">Email Security</p>
          <NavItem to="/history" icon={History} name="Email History" />
          <NavItem to="/reports" icon={BarChart3} name="Reports" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">System</p>
          <NavItem to="/settings" icon={Settings} name="Settings" />
        </div>
      </nav>

      <div className="p-4 border-t border-[#151D28]">
         <div className="flex items-center justify-between text-sm text-gray-400">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center font-bold text-blue-300 capitalize">{user?.name.charAt(0)}</div>
               <div>
                 <p className="font-bold text-white text-xs">{user?.name}</p>
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest">Role: {user?.role.toUpperCase()}</p>
               </div>
             </div>
             <button onClick={handleLogout} className="hover:text-red-400"><LogOut size={16} /></button>
         </div>
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, name }: { to: string, icon: any, name: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm rounded ${isActive ? 'bg-[#151D28] text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200 hover:bg-[#101722]'}`}>
      <Icon size={16} />
      {name}
    </NavLink>
  );
}

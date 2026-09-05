import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Mail, Globe, Activity, FileText, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#02050A] text-gray-100 antialiased">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 bg-[#080D14] border-b border-[#151D28] flex items-center justify-between px-6">
          <div className="text-sm font-bold uppercase tracking-widest text-cyan-400">Administrator Console</div>
          <div className="text-xs uppercase text-gray-500">Threat Engine: Demo</div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-[#05080D] border-r border-[#151D28] flex flex-col">
      <div className="p-6 border-b border-[#151D28]">
        <h1 className="text-xl font-bold text-white">EMAIL THREAT</h1>
        <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">Administrator Console</p>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-600 uppercase px-4 mb-2 tracking-wider">Administration</p>
          <NavItem to="/admin" icon={ShieldCheck} name="Admin Overview" />
          <NavItem to="/admin/users" icon={Users} name="Users" />
          <NavItem to="/admin/scans" icon={Mail} name="Email Scans" />
          <NavItem to="/admin/threat-intelligence" icon={Globe} name="Threat Intel" />
          <NavItem to="/admin/system-health" icon={Activity} name="System Health" />
          <NavItem to="/admin/audit-logs" icon={FileText} name="Audit Logs" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-600 uppercase px-4 mb-2 tracking-wider">System</p>
          <NavItem to="/settings" icon={Settings} name="Settings" />
        </div>
      </nav>

      <div className="p-6 border-t border-[#151D28]">
        <div className="flex items-center justify-between text-sm text-gray-400">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center font-bold text-red-300 capitalize">
               {user?.name.charAt(0)}
             </div>
             <div>
               <p className="font-bold text-white text-xs">{user?.name}</p>
               <p className="text-[10px] text-red-500 uppercase tracking-widest">Role: {user?.role.toUpperCase()}</p>
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
    <NavLink to={to} end={to === "/admin"} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm rounded ${isActive ? 'bg-[#151D28] text-white border-l-2 border-red-500' : 'text-gray-400 hover:text-gray-200 hover:bg-[#080D14]'}`}>
      <Icon size={16} />
      {name}
    </NavLink>
  );
}

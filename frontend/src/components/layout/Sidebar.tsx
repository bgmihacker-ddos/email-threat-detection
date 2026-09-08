import {
  LayoutDashboard, Mail, ShieldAlert, History, Settings, Globe, BarChart3,
  ShieldCheck, Users, Activity, FileText, LogOut, Radio, LockKeyhole
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden w-72 shrink-0 border-r border-[#1b3037] bg-[#0c171c]/95 md:flex md:flex-col">
      <div className="border-b border-[#1b3037] px-6 pb-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3b5e60] bg-[#142b2d] text-[#58d6c0] shadow-[0_0_24px_rgba(88,214,192,0.12)]"><ShieldCheck size={20} /></div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.12em] text-white">EMAIL THREAT</h1>
              <p className="mt-0.5 font-mono text-[9px] font-semibold tracking-[0.24em] text-[#58d6c0]">FORENSIC INTELLIGENCE</p>
            </div>
          </div>
          <span className="mt-1 rounded border border-[#31514e] px-1.5 py-1 font-mono text-[9px] text-[#80bdb0]">v1.5</span>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-md border border-[#1b3037] bg-[#101f24] px-3 py-2.5">
          <div className="flex items-center gap-2"><Radio size={14} className="text-[#58d6c0]" /><span className="text-[11px] font-medium text-[#d6e1de]">Telemetry fabric</span></div>
          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" /> live</span>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto p-4">
        <div className="space-y-1">
            <p className="mb-2 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#718581]">Workspace</p>
          <NavItem to="/" icon={LayoutDashboard} name="Dashboard" />
          <NavItem to="/analyze" icon={Mail} name="Analyze Email" />
        </div>

        <div className="space-y-1">
            <p className="mb-2 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#718581]">Threat intelligence</p>
          <NavItem to="/live-threat" icon={Globe} name="Live Threat" />
          <NavItem to="/threats" icon={ShieldAlert} name="Threats" />
          <NavItem to="/indicators" icon={Activity} name="Indicators" />
        </div>

        <div className="space-y-1">
            <p className="mb-2 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#718581]">Email security</p>
          <NavItem to="/history" icon={History} name="Email History" />
          <NavItem to="/reports" icon={BarChart3} name="Reports" />
        </div>

        <div className="space-y-1">
            <p className="mb-2 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#718581]">Workspace controls</p>
          <NavItem to="/settings" icon={Settings} name="Settings" />
        </div>

        {isAdmin && (
            <div className="space-y-1">
            <p className="mb-2 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#718581]">Administration</p>
            <NavItem to="/admin" icon={ShieldCheck} name="Admin Overview" />
            <NavItem to="/admin/users" icon={Users} name="Users" />
            <NavItem to="/admin/scans" icon={Mail} name="Email Scans" />
            <NavItem to="/admin/threat-intelligence" icon={Globe} name="Threat Intel" />
            <NavItem to="/admin/system-health" icon={Activity} name="System Health" />
            <NavItem to="/admin/audit-logs" icon={FileText} name="Audit Logs" />
            </div>
        )}
      </nav>

      <div className="border-t border-[#1b3037] p-4">
        <div className="flex items-center justify-between text-sm text-gray-400">
           <div className="flex items-center gap-3">
             <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3b5e60] bg-[#183235] font-bold capitalize text-[#8ce2d0]">{user?.name.charAt(0)}</div>
             <div>
               <p className="font-bold text-white text-xs">{user?.name}</p>
               <p className="mt-0.5 flex items-center gap-1 text-[9px] uppercase tracking-widest text-gray-500"><LockKeyhole size={10} /> {user?.role}</p>
             </div>
           </div>
           <button onClick={handleLogout} className="hover:text-red-400">
             <LogOut size={16} />
           </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, name }: { to: string, icon: any, name: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-md border-l-2 px-4 py-2.5 text-sm transition-all ${
          isActive
            ? 'border-[#58d6c0] bg-[#183235] text-[#8ce2d0] shadow-[inset_0_0_24px_rgba(88,214,192,0.06)]'
            : 'border-transparent text-[#9aadaa] hover:border-[#31514e] hover:bg-[#14262b] hover:text-[#e3efeb]'
        }`
      }
    >
      <Icon size={16} className="transition-transform group-hover:translate-x-0.5" />
      <span className="flex-1">{name}</span>
      <span className="font-mono text-[9px] text-[#516963] opacity-0 transition-opacity group-hover:opacity-100">↗</span>
    </NavLink>
  );
}

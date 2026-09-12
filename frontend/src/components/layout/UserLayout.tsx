import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MailSearch, ShieldAlert, History, Settings,
  Globe2, BarChart3, LogOut, Activity, Radar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SecurityEnvironmentBackground, SecurityProfile } from '../common/SecurityEnvironmentBackground';
import { TopBar } from './TopBar';

export function UserLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const segment = location.pathname.split('/')[1] || 'dashboard';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<SecurityProfile>('dashboard');

  useEffect(() => {
    if (segment === 'analyze' || segment === 'analysis') setProfile('analyze');
    else if (segment === 'live-threat') setProfile('live_threat');
    else if (segment === 'dashboard') setProfile('dashboard');
    else if (segment === 'indicators') setProfile('indicators');
    else setProfile('investigation');
  }, [segment]);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-gray-100 antialiased font-sans">
      <SecurityEnvironmentBackground profile={profile} intensity="subtle" />

      <UserSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden bg-[#0c171c]/20">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function UserSidebar({ collapsed, onToggle }: { collapsed: boolean, onToggle: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`hidden md:flex flex-col border-r border-[#1b3037] bg-[#0b171b]/95 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className={`border-b border-[#1b3037] px-4 py-4 ${collapsed ? 'px-3 flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="rounded-lg border border-[#3b5e60] bg-[#142b2d] p-2 text-[#58d6c0] cursor-pointer" onClick={onToggle}>
            <Radar size={collapsed ? 18 : 19} />
          </div>
          {!collapsed && (
            <div className="cursor-pointer" onClick={onToggle}>
              <h1 className="text-sm font-bold tracking-wide text-white">EMAIL THREAT</h1>
              <p className="text-[9px] font-bold tracking-[0.2em] text-[#58d6c0]">FORENSIC INTELLIGENCE</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavGroup label="Operations" collapsed={collapsed}>
          <NavItem to="/dashboard" icon={LayoutDashboard} name="Security overview" collapsed={collapsed} />
          <NavItem to="/analyze" icon={MailSearch} name="Analyze email" collapsed={collapsed} />
        </NavGroup>

        <NavGroup label="Threat intelligence" collapsed={collapsed}>
          <NavItem to="/live-threat" icon={Globe2} name="Live threat" collapsed={collapsed} />
          <NavItem to="/threats" icon={ShieldAlert} name="Threats" collapsed={collapsed} />
          <NavItem to="/indicators" icon={Activity} name="Indicators" collapsed={collapsed} />
        </NavGroup>

        <NavGroup label="Investigations" collapsed={collapsed}>
          <NavItem to="/history" icon={History} name="History" collapsed={collapsed} />
          <NavItem to="/reports" icon={BarChart3} name="Reports" collapsed={collapsed} />
        </NavGroup>

        <NavGroup label="Platform" collapsed={collapsed}>
          <NavItem to="/settings" icon={Settings} name="Settings" collapsed={collapsed} />
        </NavGroup>
      </nav>

      <div className="border-t border-[#1b3037] p-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} rounded-lg border border-[#1b3037] bg-[#101f24] p-2.5`}>
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3b5e60] bg-[#183235] text-sm font-bold text-[#8ce2d0]">
                {user?.name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-200">{user?.name || 'Analyst'}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">{user?.role || 'user'}</p>
              </div>
            </div>
          )}
          <button
            aria-label="Sign out"
            onClick={handleLogout}
            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-950/40 hover:text-red-400"
          >
            <LogOut size={collapsed ? 16 : 15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavGroup({ label, children, collapsed }: { label: string; children: ReactNode; collapsed: boolean }) {
  if (collapsed) {
    return <div className="space-y-1">{children}</div>;
  }
  return (
    <div>
      <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({ to, icon: Icon, name, collapsed }: { to: string; icon: typeof Activity; name: string; collapsed: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded px-3 py-2 text-xs font-medium transition-colors ${
          isActive
            ? 'border border-[#31514e] bg-[#183235] text-[#8ce2d0]'
            : 'text-[#718581] hover:bg-[#14262b] hover:text-[#e3efeb]'
        } ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? name : undefined}
    >
      <Icon size={collapsed ? 18 : 15} className="text-gray-600 transition-colors group-hover:text-cyan-400" />
      {!collapsed && name}
    </NavLink>
  );
}

import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Mail, Globe, Activity, FileText,
  Settings, LogOut, LockKeyhole, ChevronLeft, ChevronRight,
  Bell, Server
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#05080D] text-gray-100 antialiased">
      {/* Procedural background */}
      <div className="fixed inset-0 bg-security-grid pointer-events-none z-0" />
      <div className="fixed inset-0 bg-telemetry pointer-events-none z-0" />

      <AdminSidebar collapsed={sidebarCollapsed} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#151D28] bg-[#080D14]/95 px-4 md:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded border border-[#151D28] text-gray-500 hover:text-gray-300 hover:border-[#263449] transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* System health indicator */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Server size={14} className="text-gray-500" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="hidden lg:block">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Restricted area</span>
                <span className="ml-3 text-xs text-gray-400">Administrator console</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alerts indicator */}
            <button className="relative flex items-center justify-center w-9 h-9 rounded border border-[#151D28] text-gray-500 hover:text-gray-300 hover:border-[#263449] transition-colors">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Platform status */}
            <div className="flex items-center gap-2 rounded border border-emerald-500/15 bg-emerald-950/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Platform services online
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`hidden md:flex flex-col border-r border-[#151D28] bg-[#080D14] transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`border-b border-[#151D28] px-5 py-5 ${collapsed ? 'px-3 flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="rounded border border-red-500/20 bg-red-950/30 p-2 text-red-400">
            <LockKeyhole size={collapsed ? 18 : 18} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">EMAIL THREAT</h1>
              <p className="text-[9px] font-bold tracking-[0.2em] text-red-400">ADMINISTRATION</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        <div className={collapsed ? 'px-2' : 'px-3'}>
          <p className={`mb-2 ${collapsed ? 'text-[9px] text-center' : 'text-[9px]'} font-bold uppercase tracking-[0.18em] text-gray-600`}>
            {collapsed ? 'MGT' : 'Management'}
          </p>
          <div className="space-y-1">
            <AdminNavItem to="/admin" icon={ShieldCheck} name="Admin overview" collapsed={collapsed} end />
            <AdminNavItem to="/admin/users" icon={Users} name="Users" collapsed={collapsed} />
            <AdminNavItem to="/admin/scans" icon={Mail} name="Email scans" collapsed={collapsed} />
            <AdminNavItem to="/admin/threat-intelligence" icon={Globe} name="Threat intelligence" collapsed={collapsed} />
            <AdminNavItem to="/admin/system-health" icon={Activity} name="System health" collapsed={collapsed} />
            <AdminNavItem to="/admin/audit-logs" icon={FileText} name="Audit logs" collapsed={collapsed} />
          </div>
        </div>

        <div className={`pt-4 border-t border-[#151D28] mt-4 ${collapsed ? 'px-2' : 'px-3'}`}>
          <p className={`mb-2 ${collapsed ? 'text-[9px] text-center' : 'text-[9px]'} font-bold uppercase tracking-[0.18em] text-gray-600`}>
            {collapsed ? 'SYS' : 'Platform'}
          </p>
          <div className="space-y-1">
            <AdminNavItem to="/settings" icon={Settings} name="Settings" collapsed={collapsed} />
          </div>
        </div>
      </nav>

      <div className="border-t border-[#151D28] p-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} rounded bg-[#060A10] p-2.5`}>
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-950 text-sm font-bold text-red-300">
                {user?.name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-200">{user?.name || 'Administrator'}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-red-500">Administrator</p>
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

function AdminNavItem({ to, icon: Icon, name, collapsed, end }: { to: string; icon: typeof Activity; name: string; collapsed: boolean; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded px-3 py-2 text-xs font-medium transition-colors ${
          isActive
            ? 'border border-red-500/20 bg-red-950/30 text-red-200'
            : 'text-gray-500 hover:bg-[#101722] hover:text-gray-200'
        } ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? name : undefined}
    >
      <Icon size={collapsed ? 18 : 15} className="text-gray-600 transition-colors group-hover:text-red-400" />
      {!collapsed && name}
    </NavLink>
  );
}

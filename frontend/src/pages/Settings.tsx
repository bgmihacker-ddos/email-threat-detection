import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, User, Bell, Lock, Globe } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'application'>('profile');

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    jobTitle: user?.role === 'admin' ? 'Security Administrator' : 'Security Analyst',
    department: 'SOC Operations',
    timezone: 'UTC-05:00',
    avatarUrl: '',
  });

  // Security state
  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    passwordChangeRequired: false,
    sessionTimeout: '30',
    loginNotifications: true,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/16'],
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: false,
    threatCritical: true,
    threatMedium: true,
    threatLow: false,
    weeklyReport: true,
    auditEvents: true,
  });

  // Application state
  const [application, setApplication] = useState({
    theme: 'dark',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    showThreatCounts: true,
    autoRefresh: true,
    refreshInterval: '30',
  });

  const handleSaveSettings = () => {
    addToast('Settings saved successfully', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={14} /> },
    { id: 'security', label: 'Security', icon: <Lock size={14} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
    { id: 'application', label: 'Application', icon: <Globe size={14} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            Settings & Preferences
          </h1>
          <p className="text-xs text-gray-400">Manage your account and application configuration</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded"
        >
          Save Changes
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#1b3037] flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-cyan-500 text-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-[#101b21] p-5 rounded border border-[#1b3037] space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Job Title</label>
              <input
                type="text"
                value={profile.jobTitle}
                onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Timezone</label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-gray-300 rounded focus:outline-none focus:border-cyan-500"
              >
                <option value="UTC-05:00">UTC-05:00 (Eastern)</option>
                <option value="UTC-06:00">UTC-06:00 (Central)</option>
                <option value="UTC-07:00">UTC-07:00 (Mountain)</option>
                <option value="UTC-08:00">UTC-08:00 (Pacific)</option>
                <option value="UTC+00:00">UTC+00:00 (GMT)</option>
                <option value="UTC+05:30">UTC+05:30 (IST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Avatar URL (Optional)</label>
              <input
                type="text"
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-cyan-500"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-[#101b21] p-5 rounded border border-[#1b3037] space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Security Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Two‑Factor Authentication</p>
                <p className="text-xs text-gray-400">Require an additional verification step at login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={security.twoFactorEnabled}
                  onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Require Password Change</p>
                <p className="text-xs text-gray-400">Force password update on next login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={security.passwordChangeRequired}
                  onChange={(e) => setSecurity({ ...security, passwordChangeRequired: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Session Timeout (Minutes)</label>
              <select
                value={security.sessionTimeout}
                onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-gray-300 rounded focus:outline-none focus:border-cyan-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">2 hours</option>
                <option value="0">Never (not recommended)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Login Notifications</p>
                <p className="text-xs text-gray-400">Email alert on new device login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={security.loginNotifications}
                  onChange={(e) => setSecurity({ ...security, loginNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">IP Whitelist (CIDR)</label>
              <div className="space-y-2">
                {security.ipWhitelist.map((ip, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => {
                        const newList = [...security.ipWhitelist];
                        newList[idx] = e.target.value;
                        setSecurity({ ...security, ipWhitelist: newList });
                      }}
                      className="flex-1 bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-white rounded focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => {
                        const newList = security.ipWhitelist.filter((_, i) => i !== idx);
                        setSecurity({ ...security, ipWhitelist: newList });
                      }}
                      className="px-3 bg-red-900/40 hover:bg-red-900/70 border border-red-700 text-red-200 text-xs font-bold rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSecurity({ ...security, ipWhitelist: [...security.ipWhitelist, ''] })}
                  className="px-3 py-1 bg-green-900/40 hover:bg-green-900/70 border border-green-700 text-green-200 text-xs font-bold rounded"
                >
                  + Add IP Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-[#101b21] p-5 rounded border border-[#1b3037] space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notification Preferences</h2>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-white mb-3">Delivery Channels</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Email Alerts</p>
                    <p className="text-xs text-gray-400">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Push Notifications</p>
                    <p className="text-xs text-gray-400">Browser and mobile push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.pushAlerts}
                      onChange={(e) => setNotifications({ ...notifications, pushAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white mb-3">Threat Severity Alerts</p>
              <div className="space-y-3">
                {[
                  { key: 'threatCritical', label: 'Critical Threats', desc: 'Immediate action required' },
                  { key: 'threatMedium', label: 'Medium Threats', desc: 'Investigation recommended' },
                  { key: 'threatLow', label: 'Low Threats', desc: 'Informational only' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications] as boolean}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Weekly Security Report</p>
                <p className="text-xs text-gray-400">Summary of weekly threats and metrics</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Audit Event Logs</p>
                <p className="text-xs text-gray-400">Notify on security‑relevant system changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.auditEvents}
                  onChange={(e) => setNotifications({ ...notifications, auditEvents: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Application Tab */}
      {activeTab === 'application' && (
        <div className="bg-[#101b21] p-5 rounded border border-[#1b3037] space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Application Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Theme</label>
              <select
                value={application.theme}
                onChange={(e) => setApplication({ ...application, theme: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-gray-300 rounded focus:outline-none focus:border-cyan-500"
              >
                <option value="dark">Dark (Default)</option>
                <option value="darker">Darker</option>
                <option value="high-contrast">High Contrast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Language</label>
              <select
                value={application.language}
                onChange={(e) => setApplication({ ...application, language: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-gray-300 rounded focus:outline-none focus:border-cyan-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">æ—¥æœ¬èªž</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Date Format</label>
              <select
                value={application.dateFormat}
                onChange={(e) => setApplication({ ...application, dateFormat: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-gray-300 rounded focus:outline-none focus:border-cyan-500"
              >
                <option value="YYYY-MM-DD">2026-09-05</option>
                <option value="MM/DD/YYYY">09/05/2026</option>
                <option value="DD/MM/YYYY">05/09/2026</option>
                <option value="MMMM D, YYYY">September 5, 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Time Format</label>
              <select
                value={application.timeFormat}
                onChange={(e) => setApplication({ ...application, timeFormat: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-gray-300 rounded focus:outline-none focus:border-cyan-500"
              >
                <option value="24h">24-hour (14:30)</option>
                <option value="12h">12-hour (2:30 PM)</option>
              </select>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">Show Threat Counts</p>
                  <p className="text-xs text-gray-400">Display threat counters in sidebar and headers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={application.showThreatCounts}
                    onChange={(e) => setApplication({ ...application, showThreatCounts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Auto‑Refresh Dashboard</p>
                  <p className="text-xs text-gray-400">Automatically update dashboard data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={application.autoRefresh}
                    onChange={(e) => setApplication({ ...application, autoRefresh: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Refresh Interval (Seconds)</label>
              <select
                value={application.refreshInterval}
                onChange={(e) => setApplication({ ...application, refreshInterval: e.target.value })}
                className="w-full bg-[#081216] border border-[#1b3037] px-3 py-2 text-sm text-gray-300 rounded focus:outline-none focus:border-cyan-500"
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="0">Manual only</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getAdminUsers } from '../../services/adminApi';
import { AdminUserRecord, Role } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, Filter, UserPlus, UserCheck, UserX, Edit, Eye, Download, Mail, Shield, Activity } from 'lucide-react';

interface UserDetailData extends AdminUserRecord {
  recentScans: Array<{
    id: string;
    subject: string;
    verdict: string;
    scannedAt: string;
  }>;
  threatsDetected: number;
  avgProcessingTime: number;
  totalStorageUsed: string;
  lastIpAddress: string;
  department: string;
}

export default function Users() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserDetailData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { addToast } = useToast();

  useEffect(() => {
    getAdminUsers().then((data) => {
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'ALL') {
      result = result.filter((u) => u.role === selectedRole);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((u) => u.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      const multiplier = -1; // hardcode to desc for now
      return multiplier * (new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime());
    });

    setFilteredUsers(result);
  }, [searchTerm, selectedRole, selectedStatus, users]);

  const handleSuspendUser = (_userId: string, userName: string) => {
    addToast(`Suspended user "${userName}" (DEMO)`, 'warning');
  };

  const handleActivateUser = (_userId: string, userName: string) => {
    addToast(`Activated user "${userName}" (DEMO)`, 'success');
  };

  const handleEditUser = (_userId: string, userName: string) => {
    addToast(`Editing user "${userName}" (DEMO)`, 'info');
  };

  const handleExportUsers = () => {
    addToast('Exporting users list as CSV (DEMO)', 'success');
  };

  const openUserDetail = (user: AdminUserRecord) => {
    // Mock detailed user data
    const userDetail: UserDetailData = {
      ...user,
      recentScans: [
        { id: 'SCAN-2026-001', subject: 'Security Alert: Suspicious Login', verdict: 'Safe', scannedAt: '2026-09-05T09:15:00Z' },
        { id: 'SCAN-2026-002', subject: 'Invoice Payment Request', verdict: 'Suspicious', scannedAt: '2026-09-04T14:30:00Z' },
        { id: 'SCAN-2026-003', subject: 'Your Password Reset Request', verdict: 'Safe', scannedAt: '2026-09-03T11:20:00Z' },
      ],
      threatsDetected: Math.floor(Math.random() * 50) + 5,
      avgProcessingTime: Math.floor(Math.random() * 200) + 50,
      totalStorageUsed: `50.00 MB`,
      lastIpAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      department: ['SOC Operations', 'Finance', 'HR', 'Engineering', 'Executive'][Math.floor(Math.random() * 5)] as string,
    };
    setSelectedUser(userDetail);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Suspended': return 'text-red-400';
      case 'Pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'Suspended': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'Pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const getRoleBadge = (role: Role) => {
    return role === 'admin' ? 'bg-cyan-900/30 text-cyan-300 border-cyan-700' : 'bg-[#151D28] text-gray-300 border-[#1E2A3D]';
  };

  const getVerificationColor = (verification: string) => {
    switch (verification) {
      case 'Safe': return 'text-green-400';
      case 'Suspicious': return 'text-yellow-400';
      case 'Malicious': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            User Management Console
          </h1>
          <p className="text-xs text-gray-400">Manage analyst accounts, roles, and access privileges</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportUsers}
            className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded flex items-center gap-2"
          >
            <Download size={14} />
            Export Users
          </button>
          <button
            onClick={() => addToast('Open new user creation form (DEMO)', 'info')}
            className="px-4 py-2 bg-green-900/40 hover:bg-green-900/70 border border-green-700 text-green-200 text-xs font-bold rounded flex items-center gap-2"
          >
            <UserPlus size={14} />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL USERS</p>
          <p className="text-2xl font-bold text-white mt-2">{users.length}</p>
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ACTIVE USERS</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {users.filter(u => u.status === 'Active').length}
          </p>
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ADMINISTRATORS</p>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-[#080D14] p-4 rounded border border-[#151D28]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AVG SCANS/USER</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {users.length > 0 ? Math.round(users.reduce((acc, u) => acc + u.scansCount, 0) / users.length) : 0}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Filter size={14} className="text-gray-500" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>

        <select
          value="lastLogin"
          className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
        >
          <option value="lastLogin">Sort by: Last Login</option>
          <option value="name">Sort by: Name</option>
          <option value="scansCount">Sort by: Scan Count</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING USER DATABASE...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm mb-3">No users match the selected filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
                addToast('Filters reset', 'info');
              }}
              className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28] sticky top-0">
                <tr>
                  <th className="p-3 font-semibold">USER</th>
                  <th className="p-3 font-semibold">ROLE</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold">LAST LOGIN</th>
                  <th className="p-3 font-semibold">SCANS</th>
                  <th className="p-3 font-semibold">THREATS</th>
                  <th className="p-3 font-semibold">CREATED</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#0E1520] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-900/40 flex items-center justify-center text-cyan-300 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-gray-400 text-[11px] font-mono truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold uppercase ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-white">{user.scansCount}</span>
                        <span className="text-gray-500 text-[10px]">scans</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-white font-bold">{Math.floor(Math.random() * 50)}</div>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openUserDetail(user)}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-white rounded"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => handleEditUser(user.id, user.name)}
                          className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-yellow-400 rounded"
                          title="Edit User"
                        >
                          <Edit size={12} />
                        </button>
                        {user.status === 'Active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id, user.name)}
                            className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-red-400 rounded"
                            title="Suspend User"
                          >
                            <UserX size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id, user.name)}
                            className="p-1 bg-[#151D28] hover:bg-[#1E2A3D] text-gray-400 hover:text-green-400 rounded"
                            title="Activate User"
                          >
                            <UserCheck size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > itemsPerPage && (
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs bg-[#151D28] border border-[#1E2A3D] text-gray-400 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-xs text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs bg-[#151D28] border border-[#1E2A3D] text-gray-400 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end pointer-events-auto">
          <div className="bg-[#080D14] w-full max-w-2xl h-full border-l border-[#151D28] flex flex-col">
            <div className="p-4 border-b border-[#151D28] flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-900/40 flex items-center justify-center text-cyan-300 text-2xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-400 font-mono">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRoleBadge(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusBadge(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">Scans</p>
                  <p className="text-xl font-bold text-white">{selectedUser.scansCount}</p>
                </div>
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">Threats</p>
                  <p className="text-xl font-bold text-red-400">{selectedUser.threatsDetected}</p>
                </div>
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">Avg Process</p>
                  <p className="text-xl font-bold text-yellow-400">{selectedUser.avgProcessingTime}ms</p>
                </div>
                <div className="bg-[#0B111A] p-3 rounded border border-[#151D28]">
                  <p className="text-xs text-gray-500">Storage</p>
                  <p className="text-xl font-bold text-cyan-400">{selectedUser.totalStorageUsed}</p>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <Mail size={14} />
                    Account Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm text-white">{selectedUser.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Account Created</p>
                      <p className="text-sm text-white font-mono">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Login</p>
                      <p className="text-sm text-white font-mono">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last IP Address</p>
                      <p className="text-sm text-white font-mono">{selectedUser.lastIpAddress}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <Activity size={14} />
                    Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.recentScans.map((scan) => (
                      <div key={scan.id} className="p-3 bg-[#0B111A] rounded border border-[#151D28]">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-bold text-white truncate">{scan.subject}</p>
                          <span className={`text-xs font-bold ${getVerificationColor(scan.verdict)}`}>
                            {scan.verdict}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span className="font-mono">{scan.id}</span>
                          <span>{new Date(scan.scannedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#151D28] flex gap-2">
                <button
                  onClick={() => handleEditUser(selectedUser.id, selectedUser.name)}
                  className="flex-1 py-2 px-3 bg-yellow-900/40 hover:bg-yellow-900/70 border border-yellow-700 text-yellow-200 text-xs font-bold rounded"
                >
                  Edit Profile
                </button>
                {selectedUser.status === 'Active' ? (
                  <button
                    onClick={() => handleSuspendUser(selectedUser.id, selectedUser.name)}
                    className="flex-1 py-2 px-3 bg-red-900/40 hover:bg-red-900/70 border border-red-700 text-red-200 text-xs font-bold rounded"
                  >
                    Suspend Account
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateUser(selectedUser.id, selectedUser.name)}
                    className="flex-1 py-2 px-3 bg-green-900/40 hover:bg-green-900/70 border border-green-700 text-green-200 text-xs font-bold rounded"
                  >
                    Activate Account
                  </button>
                )}
                <button
                  onClick={() => {
                    addToast(`Reset password email sent to ${selectedUser.email}`, 'info');
                  }}
                  className="flex-1 py-2 px-3 bg-cyan-900/40 hover:bg-cyan-900/70 border border-cyan-700 text-cyan-200 text-xs font-bold rounded"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

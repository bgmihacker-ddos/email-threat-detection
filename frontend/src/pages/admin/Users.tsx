import { useState, useEffect } from 'react';
import { getAdminUsers } from '../../services/adminApi';
import { AdminUserRecord, Role } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, Filter, Shield, UserPlus, UserCheck, UserX } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const { addToast } = useToast();

  useEffect(() => {
    getAdminUsers().then((data) => {
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'ALL') {
      result = result.filter((u) => u.role === selectedRole);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((u) => u.status === selectedStatus);
    }

    setFilteredUsers(result);
  }, [searchTerm, selectedRole, selectedStatus, users]);

  const handleSuspendUser = (_userId: string, userName: string) => {
    addToast(`Suspended user "${userName}" (DEMO)`, 'warning');
  };

  const handleActivateUser = (_userId: string, userName: string) => {
    addToast(`Activated user "${userName}" (DEMO)`, 'success');
  };

  const handleAddUser = () => {
    addToast('Open new user creation form (DEMO)', 'info');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Suspended': return 'text-red-400';
      case 'Pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRoleBadge = (role: Role) => {
    return role === 'admin' ? 'bg-cyan-900/30 text-cyan-300 border-cyan-700' : 'bg-[#151D28] text-gray-300 border-[#1E2A3D]';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            User Management
          </h1>
          <p className="text-xs text-gray-400">Manage platform users, roles, and access control</p>
        </div>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-green-900/40 hover:bg-green-900/70 border border-green-700 text-green-200 text-xs font-bold rounded flex items-center gap-2"
        >
          <UserPlus size={14} />
          Add User
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#080D14] p-4 rounded border border-[#151D28] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#05080D] border border-[#151D28] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-[#05080D] border border-[#151D28] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
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
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#080D14] rounded border border-[#151D28] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING USER DATABASE...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            NO USERS MATCH THE GIVEN FILTER
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B111A] text-gray-400 border-b border-[#151D28]">
                <tr>
                  <th className="p-3 font-semibold">USER</th>
                  <th className="p-3 font-semibold">ROLE</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold">LAST LOGIN</th>
                  <th className="p-3 font-semibold">SCANS</th>
                  <th className="p-3 font-semibold">CREATED</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D28]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#0E1520] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-900/40 flex items-center justify-center text-cyan-300 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-gray-400 text-[11px] font-mono">{user.email}</p>
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
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        {user.status === 'Active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id, user.name)}
                            className="px-2 py-1 bg-red-900/40 hover:bg-red-900/70 border border-red-700 text-red-200 text-xs font-bold rounded flex items-center gap-1"
                          >
                            <UserX size={10} />
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id, user.name)}
                            className="px-2 py-1 bg-green-900/40 hover:bg-green-900/70 border border-green-700 text-green-200 text-xs font-bold rounded flex items-center gap-1"
                          >
                            <UserCheck size={10} />
                            Activate
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
    </div>
  );
}

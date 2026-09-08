import { useState, useEffect } from 'react';
import { getAdminUsers, activateUser, deactivateUser, updateUserRole } from '../../services/adminApi';
import { AdminUserRecord } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, Filter, Shield, UserCheck, UserX } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const { addToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
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

    setFilteredUsers(result);
  }, [searchTerm, selectedRole, selectedStatus, users]);

  const handleDeactivate = async (userId: string) => {
    try {
      await deactivateUser(userId);
      addToast('User deactivated successfully', 'success');
      loadUsers();
    } catch (err: any) {
      addToast(err.message || 'Failed to deactivate user', 'error');
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      addToast('User activated successfully', 'success');
      loadUsers();
    } catch (err: any) {
      addToast(err.message || 'Failed to activate user', 'error');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      addToast(`Role updated to ${newRole}`, 'success');
      loadUsers();
    } catch (err: any) {
      addToast(err.message || 'Failed to update role', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-cyan-400" />
            User Management Console
          </h1>
          <p className="text-xs text-gray-400">Manage registered analyst accounts and role permissions</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL USERS</p>
          <p className="text-2xl font-bold text-white mt-2">{users.length}</p>
        </div>
        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ACTIVE USERS</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {users.filter(u => u.status === 'Active').length}
          </p>
        </div>
        <div className="bg-[#101b21] p-4 rounded border border-[#1b3037]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ADMINISTRATORS</p>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#101b21] p-4 rounded border border-[#1b3037] flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#081216] border border-[#1b3037] pl-9 pr-4 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#081216] border border-[#1b3037] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#081216] border border-[#1b3037] text-xs text-gray-300 py-2 px-3 rounded focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#101b21] rounded border border-[#1b3037] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs animate-pulse">
            LOADING USER DATABASE...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            NO USERS MATCH THE SELECTED CRITERIA.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16242a] text-gray-400 border-b border-[#1b3037]">
                <tr>
                  <th className="p-3 font-semibold">USER ID</th>
                  <th className="p-3 font-semibold">EMAIL</th>
                  <th className="p-3 font-semibold">ROLE</th>
                  <th className="p-3 font-semibold">STATUS</th>
                  <th className="p-3 font-semibold">CREATED</th>
                  <th className="p-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b3037]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#1b2b31] transition-colors">
                    <td className="p-3 font-mono text-cyan-400">{user.id.slice(0, 12)}…</td>
                    <td className="p-3 text-white">{user.email}</td>
                    <td className="p-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-[#081216] border border-[#1b3037] text-[10px] text-gray-300 py-1 px-2 rounded"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold uppercase ${user.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        {user.status === 'Active' ? (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            className="p-1 bg-[#1b3037] hover:bg-red-950 text-gray-400 hover:text-red-400 rounded"
                            title="Deactivate User"
                          >
                            <UserX size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="p-1 bg-[#1b3037] hover:bg-green-950 text-gray-400 hover:text-green-400 rounded"
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
    </div>
  );
}

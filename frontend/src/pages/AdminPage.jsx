import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Files,
  HardDrive,
  Activity,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminPage() {
  const [systemStats, setSystemStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' or 'logs'

  // User delete confirmation
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/system-stats'),
        api.get('/admin/users'),
        api.get('/admin/logs'),
      ]);

      if (statsRes.data.success) setSystemStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (logsRes.data.success) setActivityLogs(logsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      const res = await api.delete(`/admin/users/${userToDelete._id}`);
      if (res.data.success) {
        setUsers(users.filter((u) => u._id !== userToDelete._id));
        setUserToDelete(null);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrative Portal
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            System Administration & Audit Controls
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role management, multi-user accounts, storage oversight, and comprehensive security audit trail.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 self-start sm:self-auto"
          title="Refresh admin records"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* System KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-400">Total Users</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{systemStats?.totalUsers || 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{systemStats?.totalAdmins || 0} Admins</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-400">Vault Documents</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {systemStats?.totalDocuments || 0}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">System-wide files</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Files className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-400">Storage Footprint</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {systemStats?.totalStorageMB || '0.00'} MB
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Attachments size</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-400">Logged Events</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{activityLogs.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Security audit entries</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Users vs Activity Logs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'users'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Users Management ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'logs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit & Activity Logs ({activityLogs.length})
        </button>
      </div>

      {/* Sub-tab 1: Users Table */}
      {activeSubTab === 'users' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-500">{u.organization || 'Personal'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {u.documentCount || 0} doc{u.documentCount !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRoleToggle(u._id, u.role)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                          title="Toggle user/admin role"
                        >
                          Make {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Sub-tab 2: Activity Logs Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activityLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-100 text-blue-800'
                            : log.action === 'RENEW'
                            ? 'bg-amber-100 text-amber-800'
                            : log.action === 'DELETE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {log.userName || log.user?.name || 'System'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">
                      {log.documentTitle || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{log.details || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Delete User Account"
        message={`Are you sure you want to remove user "${userToDelete?.name}" (${userToDelete?.email})? All documents owned by this user will also be permanently deleted.`}
        confirmText="Confirm Delete User"
        confirmColor="rose"
        loading={deletingUser}
        onConfirm={handleDeleteUserConfirm}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}

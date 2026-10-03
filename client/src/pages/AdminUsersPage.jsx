import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { listAdminUsers, updateUserStatus } from '../services/adminApi';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'deactivate' | 'reactivate'
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await listAdminUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter !== '' ? statusFilter : undefined
      });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toastError(err?.response?.data?.message || 'Failed to load user list.');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, toastError]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handleOpenModal = (user, type) => {
    if (user.id === currentAdmin.id && type === 'deactivate') {
      toastError('Administrators cannot deactivate their own account.');
      return;
    }
    setSelectedUser(user);
    setActionType(type);
    setReason('');
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setActionType(null);
    setReason('');
    setIsSubmitting(false);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    const newStatus = actionType === 'reactivate';

    try {
      await updateUserStatus(selectedUser.id, newStatus, reason);
      success(
        newStatus
          ? `User "${selectedUser.name}" reactivated successfully.`
          : `User "${selectedUser.name}" deactivated.`
      );
      handleCloseModal();
      loadUsers(pagination.page);
    } catch (err) {
      toastError(err?.response?.data?.message || 'Failed to update user status.');
      setIsSubmitting(false);
    }
  };

  const roleBadges = {
    ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    DONOR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    NGO: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    SHELTER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    VOLUNTEER: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with breadcrumbs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Link to="/admin/dashboard" className="hover:text-emerald-400 transition">Admin Dashboard</Link>
              <span>/</span>
              <span className="text-slate-200">Users</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
            <p className="mt-1 text-sm text-slate-400">
              Review community registrations, search users, and manage account authorization status.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="self-start sm:self-auto rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            ← Back to Overview
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          {/* Search */}
          <div className="sm:col-span-2">
            <label htmlFor="user-search" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Search Users
            </label>
            <div className="relative">
              <input
                id="user-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, organization, city..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="role-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Role Filter
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="DONOR">Donors</option>
              <option value="NGO">NGOs</option>
              <option value="SHELTER">Shelters</option>
              <option value="VOLUNTEER">Volunteers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Account Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive / Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-6">
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : users.length === 0 ? (
            <EmptyState
              title="No users match your criteria"
              description="Try adjusting your search terms or filters."
              actionText="Clear Filters"
              onAction={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }}
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">User Details</th>
                    <th scope="col" className="px-6 py-4">Organization / Location</th>
                    <th scope="col" className="px-6 py-4">Role</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((user) => {
                    const isSelf = user.id === currentAdmin.id;
                    return (
                      <tr key={user.id} className="hover:bg-slate-850/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-emerald-400 font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                          {user.phone && <div className="text-xs text-slate-500">📞 {user.phone}</div>}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-200">{user.organization_name || 'Individual'}</div>
                          <div className="text-xs text-slate-500">
                            {[user.city, user.state].filter(Boolean).join(', ') || 'India'}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                              roleBadges[user.role] || 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                              Deactivated
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isSelf ? (
                            <span className="text-xs text-slate-500 italic">Self Account</span>
                          ) : user.is_active ? (
                            <button
                              onClick={() => handleOpenModal(user, 'deactivate')}
                              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(user, 'reactivate')}
                              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
              <p className="text-xs text-slate-400">
                Showing page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
                <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} total users)
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadUsers(pagination.page - 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadUsers(pagination.page + 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedUser)}
        title={
          actionType === 'deactivate'
            ? `Deactivate ${selectedUser?.name}?`
            : `Reactivate ${selectedUser?.name}?`
        }
        message={
          actionType === 'deactivate'
            ? `Deactivating this user will prevent them from logging in and accessing platform features. This action is recorded in the platform audit log.`
            : `Reactivating will restore this user's account access and platform permissions.`
        }
        confirmText={actionType === 'deactivate' ? 'Deactivate User' : 'Reactivate User'}
        confirmVariant={actionType === 'deactivate' ? 'danger' : 'primary'}
        isLoading={isSubmitting}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCloseModal}
      >
        <div className="mt-3">
          <label htmlFor="action-reason" className="block text-xs font-medium text-slate-400 mb-1">
            Reason / Administrative Note (Optional)
          </label>
          <input
            id="action-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Inappropriate behavior, account verification..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </ConfirmModal>
    </div>
  );
}

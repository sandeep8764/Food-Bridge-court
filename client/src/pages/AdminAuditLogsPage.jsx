import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import { listAdminAuditLogs } from '../services/adminApi';

export default function AdminAuditLogsPage() {
  const { error: toastError } = useToast();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await listAdminAuditLogs({
        page,
        limit: 15,
        search: search.trim() || undefined,
        action: actionFilter || undefined
      });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toastError(err?.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [search, actionFilter, toastError]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const actionBadges = {
    USER_ACTIVATED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    USER_DEACTIVATED: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    ADMIN_DONATION_STATUS_CHANGE: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
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
              <span className="text-slate-200">Audit Logs</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Audit Trail</h1>
            <p className="mt-1 text-sm text-slate-400">
              Immutable historical logs of all administrative modifications and privilege adjustments.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="self-start sm:self-auto rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            ← Back to Overview
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="sm:col-span-2">
            <label htmlFor="audit-search" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Search Logs
            </label>
            <div className="relative">
              <input
                id="audit-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action, administrator, target email..."
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

          <div>
            <label htmlFor="action-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Action Type
            </label>
            <select
              id="action-filter"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="USER_ACTIVATED">User Activated</option>
              <option value="USER_DEACTIVATED">User Deactivated</option>
              <option value="ADMIN_DONATION_STATUS_CHANGE">Donation Status Change</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="mt-6">
          {isLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No audit log entries recorded"
              description="Administrative actions such as user status updates and cancellations will appear here."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">Timestamp</th>
                    <th scope="col" className="px-6 py-4">Administrator</th>
                    <th scope="col" className="px-6 py-4">Action</th>
                    <th scope="col" className="px-6 py-4">Target Entity</th>
                    <th scope="col" className="px-6 py-4">Details & Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                        <div>
                          {new Date(log.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-slate-500">
                          {new Date(log.created_at).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{log.user_name || 'System Admin'}</div>
                        <div className="text-xs text-slate-400">{log.user_email || `Admin ID #${log.user_id}`}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                            actionBadges[log.action] || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
                          {log.entity_type} #{log.entity_id}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {log.details ? (
                          <div className="max-w-md bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 text-slate-300 space-y-1">
                            {log.details.target_email && (
                              <div><span className="text-slate-500">Target:</span> {log.details.target_name} ({log.details.target_email})</div>
                            )}
                            {log.details.reason && (
                              <div><span className="text-slate-500">Reason:</span> {log.details.reason}</div>
                            )}
                            {log.details.new_status !== undefined && (
                              <div><span className="text-slate-500">Status:</span> {String(log.details.new_status)}</div>
                            )}
                            {log.details.previous_status && (
                              <div><span className="text-slate-500">Transition:</span> {log.details.previous_status} → {log.details.new_status}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
              <p className="text-xs text-slate-400">
                Showing page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
                <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} total log entries)
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadLogs(pagination.page - 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadLogs(pagination.page + 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

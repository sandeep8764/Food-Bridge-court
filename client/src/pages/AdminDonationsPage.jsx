import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DonationStatusBadge from '../components/DonationStatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import { listAdminDonations, updateAdminDonationStatus } from '../services/adminApi';

const CATEGORIES = [
  'Cooked Meals',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Packaged Food',
  'Dairy',
  'Beverages',
  'Other'
];

const STATUSES = [
  'AVAILABLE',
  'CLAIMED',
  'PICKUP_ASSIGNED',
  'PICKED_UP',
  'DELIVERED',
  'EXPIRED',
  'CANCELLED'
];

export default function AdminDonationsPage() {
  const { success, error: toastError } = useToast();

  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal & Action Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDonations = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await listAdminDonations({
        page,
        limit: 10,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined
      });
      setDonations(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toastError(err?.response?.data?.message || 'Failed to load donations.');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, statusFilter, toastError]);

  useEffect(() => {
    loadDonations(1);
  }, [loadDonations]);

  const handleOpenCancelModal = (donation) => {
    setSelectedDonation(donation);
    setCancelModalOpen(true);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedDonation) return;
    setIsSubmitting(true);
    try {
      await updateAdminDonationStatus(selectedDonation.id, 'CANCELLED', cancelReason || 'Administrative cancellation');
      success(`Donation #${selectedDonation.id} (${selectedDonation.food_name}) was cancelled.`);
      setCancelModalOpen(false);
      setSelectedDonation(null);
      loadDonations(pagination.page);
    } catch (err) {
      toastError(err?.response?.data?.message || 'Failed to cancel donation.');
    } finally {
      setIsSubmitting(false);
    }
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
              <span className="text-slate-200">Donations</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Donation Management</h1>
            <p className="mt-1 text-sm text-slate-400">
              Oversee food surplus listings, verify distribution lifecycles, and handle exceptions safely.
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
            <label htmlFor="donation-search" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Search Food or Donor
            </label>
            <div className="relative">
              <input
                id="donation-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food item, description, donor, address..."
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

          {/* Category Filter */}
          <div>
            <label htmlFor="cat-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              id="cat-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="stat-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              id="stat-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="mt-6">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : donations.length === 0 ? (
            <EmptyState
              title="No donations match your query"
              description="Try changing the category, status, or search term."
              actionText="Clear Filters"
              onAction={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); }}
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">Food Item</th>
                    <th scope="col" className="px-6 py-4">Category / Quantity</th>
                    <th scope="col" className="px-6 py-4">Donor / Pickup Location</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Expiry Date</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{d.food_name}</div>
                        <div className="text-xs text-emerald-400">🍲 ~{d.estimated_meals} Meals</div>
                        {d.description && (
                          <div className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{d.description}</div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
                          {d.food_category}
                        </span>
                        <div className="mt-1 text-xs text-slate-400">{d.quantity} {d.quantity_unit}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium">{d.donor_organization_name || d.donor_name || 'Donor'}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate">{d.address}</div>
                        {d.city && <div className="text-xs text-slate-500">{d.city}, {d.state}</div>}
                      </td>

                      <td className="px-6 py-4">
                        <DonationStatusBadge status={d.status} />
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="text-slate-300">
                          {new Date(d.expiry_time).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-slate-500">
                          {new Date(d.expiry_time).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/donor/donations/${d.id}`}
                          className="inline-block rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                        >
                          View
                        </Link>

                        {d.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleOpenCancelModal(d)}
                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
              <p className="text-xs text-slate-400">
                Showing page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
                <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} total listings)
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadDonations(pagination.page - 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadDonations(pagination.page + 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title={`Cancel Donation #${selectedDonation?.id}?`}
        message={`Are you sure you want to cancel "${selectedDonation?.food_name}"? Historical donation records are preserved, but its status will be updated to CANCELLED and logged in the audit trail.`}
        confirmText="Cancel Donation"
        confirmVariant="danger"
        isLoading={isSubmitting}
        onConfirm={handleConfirmCancel}
        onCancel={() => { setCancelModalOpen(false); setSelectedDonation(null); }}
      >
        <div className="mt-3">
          <label htmlFor="cancel-reason" className="block text-xs font-medium text-slate-400 mb-1">
            Cancellation Reason
          </label>
          <input
            id="cancel-reason"
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Inappropriate item, expired before pickup, duplicate listing..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </ConfirmModal>
    </div>
  );
}

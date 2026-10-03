import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DonationStatusBadge from '../components/DonationStatusBadge';
import EmptyState from '../components/EmptyState';
import { CardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getNgoAnalytics } from '../services/analyticsApi';
import { listNgoClaims } from '../services/donationApi';

export default function NgoDashboardPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const [analyticsRes, claimsRes] = await Promise.all([
        getNgoAnalytics(),
        listNgoClaims({ page, limit: 10 })
      ]);
      setStats(analyticsRes.data.data);
      setClaims(claimsRes.data.data);
      setPagination(claimsRes.data.pagination);
    } catch (err) {
      toastError(err?.response?.data?.message || 'Failed to load NGO dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold uppercase text-cyan-300 border border-cyan-500/30">
                {user?.role} Portal
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              {user?.organization_name || user?.name || 'NGO / Shelter'} Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage claimed surplus food supplies, monitor volunteer pickups, and discover nearby donations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/nearby-donations"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find Nearby Food
            </Link>
          </div>
        </div>

        {/* Impact Cards */}
        {isLoading ? (
          <div className="mt-8">
            <CardSkeleton count={3} />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Donations Claimed</div>
              <div className="mt-3 text-3xl font-black text-white">{stats?.donations_claimed || 0}</div>
              <p className="mt-1 text-xs text-slate-500">Reserved for community distribution</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 backdrop-blur-sm shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">Meals Received</div>
              <div className="mt-3 text-3xl font-black text-emerald-400">
                {(stats?.meals_received || 0).toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-emerald-500/80">Delivered meals served to beneficiaries</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Deliveries</div>
              <div className="mt-3 text-3xl font-black text-cyan-400">{stats?.successful_deliveries || 0}</div>
              <p className="mt-1 text-xs text-slate-500">Volunteers delivered directly to your shelter/NGO</p>
            </div>
          </div>
        )}

        {/* Claimed Donations Table */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Claimed Supplies</h2>
              <p className="text-xs text-slate-400">Track current and historical claimed food items.</p>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : claims.length === 0 ? (
            <EmptyState
              title="You haven't claimed any donations yet"
              description="Explore the live nearby donations map to discover surplus food ready for claim."
              actionText="Browse Available Donations"
              actionLink="/nearby-donations"
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">Food Item</th>
                    <th scope="col" className="px-6 py-4">Donor & Location</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Volunteer Task</th>
                    <th scope="col" className="px-6 py-4">Claimed At</th>
                    <th scope="col" className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {claims.map((claim) => (
                    <tr key={claim.claim_id} className="hover:bg-slate-850/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{claim.food_name}</div>
                        <div className="text-xs text-emerald-400">🍲 {claim.estimated_meals} Meals ({claim.quantity} {claim.quantity_unit})</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium">{claim.donor_organization_name || claim.donor_name}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate">{claim.address}</div>
                      </td>

                      <td className="px-6 py-4">
                        <DonationStatusBadge status={claim.donation_status} />
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {claim.task_id ? (
                          <div>
                            <span className="rounded bg-slate-800 px-2 py-0.5 font-medium text-amber-300 border border-amber-500/20">
                              {claim.task_status}
                            </span>
                            {claim.volunteer_name && (
                              <div className="mt-1 text-slate-400">🚴 {claim.volunteer_name}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No volunteer assigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(claim.claimed_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/donor/donations/${claim.donation_id}`}
                          className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
              <p className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} claims)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadData(pagination.page - 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadData(pagination.page + 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

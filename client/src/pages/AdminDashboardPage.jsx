import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MonthlyAnalyticsChart from '../components/analytics/MonthlyAnalyticsChart';
import CategoryChart from '../components/analytics/CategoryChart';
import StatusChart from '../components/analytics/StatusChart';
import UserRoleChart from '../components/analytics/UserRoleChart';
import { CardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import { getAdminAnalyticsData, getAdminDashboard } from '../services/adminApi';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          getAdminDashboard(),
          getAdminAnalyticsData()
        ]);
        setSummary(dashRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load administrative metrics.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Quick Navigation Links */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-3xl font-extrabold tracking-tight">Admin Command Center</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              System-wide metrics, user access controls, donation workflows, and audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-700 hover:text-white transition"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Management
            </Link>

            <Link
              to="/admin/donations"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-700 hover:text-white transition"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Donation Management
            </Link>

            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-700 hover:text-white transition"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Audit Logs
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 space-y-8">
            <CardSkeleton count={5} />
            <CardSkeleton count={4} />
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        ) : summary ? (
          <div className="mt-8 space-y-10">
            {/* Section 1: Community & Stakeholders Overview */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
                Community Members & Roles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Total Users</span>
                    <span className="text-emerald-400">● {summary.active_users} Active</span>
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-white">{summary.total_users}</div>
                  <p className="mt-1 text-xs text-slate-400">All registered platform accounts</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Total Donors</div>
                  <div className="mt-3 text-3xl font-extrabold text-emerald-400">{summary.total_donors}</div>
                  <p className="mt-1 text-xs text-slate-400">Restaurants, caterers & events</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Total NGOs</div>
                  <div className="mt-3 text-3xl font-extrabold text-cyan-400">{summary.total_ngos}</div>
                  <p className="mt-1 text-xs text-slate-400">Verified distribution partners</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Total Shelters</div>
                  <div className="mt-3 text-3xl font-extrabold text-purple-400">{summary.total_shelters}</div>
                  <p className="mt-1 text-xs text-slate-400">Care homes & community shelters</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Total Volunteers</div>
                  <div className="mt-3 text-3xl font-extrabold text-amber-400">{summary.total_volunteers}</div>
                  <p className="mt-1 text-xs text-slate-400">Pickup & delivery champions</p>
                </div>
              </div>
            </section>

            {/* Section 2: Donation Workflows & Operational Health */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
                Donations & Platform Impact
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Total Donations</div>
                  <div className="mt-3 text-2xl font-bold text-white">{summary.total_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">All-time listings</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Active Donations</div>
                  <div className="mt-3 text-2xl font-bold text-cyan-400">{summary.active_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">Available or in transit</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Delivered</div>
                  <div className="mt-3 text-2xl font-bold text-emerald-400">{summary.delivered_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">Successfully distributed</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-semibold uppercase">Expired</div>
                  <div className="mt-3 text-2xl font-bold text-rose-400">{summary.expired_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">Unclaimed before expiry</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 backdrop-blur-sm lg:col-span-1">
                  <div className="text-emerald-300 text-xs font-semibold uppercase">Meals Saved</div>
                  <div className="mt-3 text-2xl font-extrabold text-emerald-400">
                    {summary.total_meals_saved.toLocaleString()}
                  </div>
                  <p className="mt-1 text-xs text-emerald-500/80">Nutritious meals provided</p>
                </div>

                <div className="rounded-2xl border border-teal-500/20 bg-teal-950/20 p-5 backdrop-blur-sm lg:col-span-1">
                  <div className="text-teal-300 text-xs font-semibold uppercase">CO2 Offset</div>
                  <div className="mt-3 text-2xl font-extrabold text-teal-400">
                    {summary.total_co2_offset.toLocaleString()} <span className="text-sm font-normal">kg</span>
                  </div>
                  <p className="mt-1 text-xs text-teal-500/80">Greenhouse gas prevented</p>
                </div>
              </div>
            </section>

            {/* Section 3: Visual Analytics & Breakdown */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Trends & Analytical Breakdowns
              </h2>

              {analytics?.monthly && analytics.monthly.length > 0 && (
                <MonthlyAnalyticsChart
                  data={analytics.monthly.map((m) => ({ ...m, month: m.month_name }))}
                />
              )}

              <div className="grid gap-6 lg:grid-cols-3">
                {analytics?.categories && analytics.categories.length > 0 && (
                  <CategoryChart data={analytics.categories} />
                )}

                {analytics?.status && analytics.status.length > 0 && (
                  <StatusChart data={analytics.status} />
                )}

                {summary.users_by_role && summary.users_by_role.length > 0 && (
                  <UserRoleChart data={summary.users_by_role} />
                )}
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

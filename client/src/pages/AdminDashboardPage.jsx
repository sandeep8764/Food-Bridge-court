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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900 selection:bg-emerald-500 selection:text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-emerald-100 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-900">Admin Command Center</h1>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              System-wide metrics, user access controls, donation workflows, and audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Management
            </Link>

            <Link
              to="/admin/donations"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              <svg className="h-4 w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Donation Management
            </Link>

            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Audit Logs
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
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
            <section>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                Community Members & Roles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                    <span>Total Users</span>
                    <span className="text-emerald-700">● {summary.active_users} Active</span>
                  </div>
                  <div className="mt-3 text-3xl font-black text-slate-900">{summary.total_users}</div>
                  <p className="mt-1 text-xs text-slate-500">All registered platform accounts</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Total Donors</div>
                  <div className="mt-3 text-3xl font-black text-emerald-700">{summary.total_donors}</div>
                  <p className="mt-1 text-xs text-slate-500">Restaurants, caterers & events</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Total NGOs</div>
                  <div className="mt-3 text-3xl font-black text-cyan-700">{summary.total_ngos}</div>
                  <p className="mt-1 text-xs text-slate-500">Verified distribution partners</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Total Shelters</div>
                  <div className="mt-3 text-3xl font-black text-violet-700">{summary.total_shelters}</div>
                  <p className="mt-1 text-xs text-slate-500">Care homes & community shelters</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Total Volunteers</div>
                  <div className="mt-3 text-3xl font-black text-amber-700">{summary.total_volunteers}</div>
                  <p className="mt-1 text-xs text-slate-500">Pickup & delivery champions</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Donations & Platform Impact
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Total Donations</div>
                  <div className="mt-3 text-2xl font-black text-slate-900">{summary.total_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">All-time listings</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Active Donations</div>
                  <div className="mt-3 text-2xl font-black text-cyan-700">{summary.active_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">Available or in transit</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Delivered</div>
                  <div className="mt-3 text-2xl font-black text-emerald-700">{summary.delivered_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">Successfully distributed</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="text-xs font-semibold uppercase text-slate-500">Expired</div>
                  <div className="mt-3 text-2xl font-black text-rose-600">{summary.expired_donations}</div>
                  <p className="mt-1 text-xs text-slate-500">Unclaimed before expiry</p>
                </div>

                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] lg:col-span-1">
                  <div className="text-xs font-semibold uppercase text-emerald-700">Meals Saved</div>
                  <div className="mt-3 text-2xl font-black text-emerald-700">{summary.total_meals_saved.toLocaleString()}</div>
                  <p className="mt-1 text-xs text-emerald-600">Nutritious meals provided</p>
                </div>

                <div className="rounded-[24px] border border-teal-200 bg-teal-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] lg:col-span-1">
                  <div className="text-xs font-semibold uppercase text-teal-700">CO2 Offset</div>
                  <div className="mt-3 text-2xl font-black text-teal-700">{summary.total_co2_offset.toLocaleString()} <span className="text-sm font-normal">kg</span></div>
                  <p className="mt-1 text-xs text-teal-600">Greenhouse gas prevented</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Trends & Analytical Breakdowns
              </h2>

              {analytics?.monthly && analytics.monthly.length > 0 && (
                <div className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                  <MonthlyAnalyticsChart data={analytics.monthly.map((m) => ({ ...m, month: m.month_name }))} />
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-3">
                {analytics?.categories && analytics.categories.length > 0 && (
                  <div className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                    <CategoryChart data={analytics.categories} />
                  </div>
                )}

                {analytics?.status && analytics.status.length > 0 && (
                  <div className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                    <StatusChart data={analytics.status} />
                  </div>
                )}

                {summary.users_by_role && summary.users_by_role.length > 0 && (
                  <div className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                    <UserRoleChart data={summary.users_by_role} />
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

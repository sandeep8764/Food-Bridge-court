import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import DonationTable from '../components/DonationTable';
import AnalyticsCards from '../components/analytics/AnalyticsCards';
import MonthlyAnalyticsChart from '../components/analytics/MonthlyAnalyticsChart';
import { getDonorAnalytics, getAnalyticsMonthly } from '../services/analyticsApi';

export default function DonorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsResponse, analyticsResponse, monthlyResponse] = await Promise.all([
          api.get('/donations/donor/dashboard'),
          getDonorAnalytics(),
          getAnalyticsMonthly()
        ]);
        setStats(statsResponse.data.data);
        setAnalytics(analyticsResponse.data.data);
        setMonthly(monthlyResponse.data.data.map((entry) => ({ ...entry, month: entry.month_name })));
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load dashboard');
      }
    }

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-emerald-100 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            Donor portal
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">Donor Dashboard</h1>
          <p className="mt-2 text-base text-slate-600">Track donation activity, meals saved, and recent submissions in one place.</p>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        {stats && (
          <>
            <div className="mt-6">
              <AnalyticsCards
                cards={[
                  { label: 'Total Donations', value: stats.totalDonations },
                  { label: 'Meals Saved', value: analytics?.meals_saved ?? 0 },
                  { label: 'Delivered Donations', value: analytics?.delivered_donations ?? stats.deliveredDonations },
                  { label: 'CO2 Offset', value: analytics?.co2_offset ?? 0, helper: 'Estimated CO2 offset is calculated using the configured application factor.' }
                ]}
              />
            </div>

            {monthly.length > 0 && (
              <section className="mt-8 rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <MonthlyAnalyticsChart data={monthly} />
              </section>
            )}

            <section className="mt-8 rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <h2 className="text-xl font-bold text-slate-900">Recent Donations</h2>
              <div className="mt-4">
                <DonationTable donations={stats.recentDonations} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

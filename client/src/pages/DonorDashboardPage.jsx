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
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">Donor Dashboard</h1>
        <p className="mt-2 text-slate-400">Track your donation activity and recent submissions.</p>

        {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}

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
              <section className="mt-8">
                <MonthlyAnalyticsChart data={monthly} />
              </section>
            )}

            <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Recent Donations</h2>
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

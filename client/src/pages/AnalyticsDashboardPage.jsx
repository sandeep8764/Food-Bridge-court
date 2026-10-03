import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import AnalyticsCards from '../components/analytics/AnalyticsCards';
import MonthlyAnalyticsChart from '../components/analytics/MonthlyAnalyticsChart';
import CategoryChart from '../components/analytics/CategoryChart';
import StatusChart from '../components/analytics/StatusChart';
import { getAdminAnalytics, getAnalyticsCategories, getAnalyticsMonthly, getAnalyticsOverview, getAnalyticsStatus, getDonorAnalytics, getNgoAnalytics } from '../services/analyticsApi';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState([]);
  const [roleStats, setRoleStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [overviewResponse, monthlyResponse, categoriesResponse, statusResponse] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsMonthly(),
          getAnalyticsCategories(),
          getAnalyticsStatus()
        ]);

        setOverview(overviewResponse.data.data);
        setMonthly(monthlyResponse.data.data.map((entry) => ({ ...entry, month: entry.month_name })));
        setCategories(categoriesResponse.data.data);
        setStatus(statusResponse.data.data);

        if (user?.role === 'DONOR') {
          const response = await getDonorAnalytics();
          setRoleStats(response.data.data);
        } else if (user?.role === 'ADMIN') {
          const response = await getAdminAnalytics();
          setRoleStats(response.data.data.overview);
        } else if (user?.role === 'NGO' || user?.role === 'SHELTER') {
          const response = await getNgoAnalytics();
          setRoleStats(response.data.data);
        }
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load analytics');
      }
    }

    load();
  }, [user?.role]);

  const cards = useMemo(() => {
    if (!overview) {
      return [];
    }

    const baseCards = [
      { label: 'Total Donations', value: overview.total_donations },
      { label: 'Available Donations', value: overview.available_donations },
      { label: 'Claimed Donations', value: overview.claimed_donations },
      { label: 'Delivered Donations', value: overview.delivered_donations },
      { label: 'Expired Donations', value: overview.expired_donations },
      { label: 'Cancelled Donations', value: overview.cancelled_donations },
      { label: 'Meals Saved', value: overview.total_meals_saved },
      { label: 'CO2 Offset', value: overview.total_co2_offset, helper: 'Estimated CO2 offset is calculated using the configured application factor.' }
    ];

    if (user?.role === 'DONOR' && roleStats) {
      return [
        { label: 'Your Total Donations', value: roleStats.total_donations },
        { label: 'Your Meals Saved', value: roleStats.meals_saved },
        { label: 'Your Delivered Donations', value: roleStats.delivered_donations },
        { label: 'Your CO2 Offset', value: roleStats.co2_offset, helper: 'Estimated CO2 offset is calculated using the configured application factor.' }
      ];
    }

    if ((user?.role === 'NGO' || user?.role === 'SHELTER') && roleStats) {
      return [
        { label: 'Donations Claimed', value: roleStats.donations_claimed },
        { label: 'Meals Received', value: roleStats.meals_received },
        { label: 'Successful Deliveries', value: roleStats.successful_deliveries }
      ];
    }

    return baseCards;
  }, [overview, roleStats, user?.role]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="mt-2 text-slate-400">Dynamic analytics backed by MySQL aggregations.</p>
          </div>
          <p className="max-w-2xl text-sm text-slate-500">Estimated CO2 offset is calculated using the configured application factor.</p>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}

        {cards.length > 0 && (
          <section className="mt-6">
            <AnalyticsCards cards={cards} />
          </section>
        )}

        {monthly.length > 0 && (
          <section className="mt-6">
            <MonthlyAnalyticsChart data={monthly} />
          </section>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {categories.length > 0 && <CategoryChart data={categories} />}
          {status.length > 0 && <StatusChart data={status} />}
        </div>
      </main>
    </div>
  );
}
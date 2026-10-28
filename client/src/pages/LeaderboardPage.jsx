import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import { CardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import { getLeaderboard } from '../services/analyticsApi';

export default function LeaderboardPage() {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getLeaderboard(20);
        setDonors(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load leaderboard rankings.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const top3 = donors.slice(0, 3);
  const rest = donors.slice(3);

  const medalEmojis = ['🥇', '🥈', '🥉'];
  const podiumStyles = [
    'border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-[0_16px_40px_rgba(245,158,11,0.12)]',
    'border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-[0_16px_40px_rgba(148,163,184,0.18)]',
    'border-amber-200 bg-gradient-to-b from-orange-50 to-white shadow-[0_16px_40px_rgba(251,146,60,0.12)]'
  ];

  const totalMealsSaved = donors.reduce((sum, donor) => sum + Number(donor.total_meals_saved || 0), 0);
  const totalImpact = donors.reduce((sum, donor) => sum + Number(donor.co2_offset_kg || 0), 0);
  const averageMeals = donors.length ? Math.round(totalMealsSaved / donors.length) : 0;
  const topDonor = donors[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),transparent_26%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900 selection:bg-emerald-500 selection:text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            🏆 Community Champions
          </div>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-6xl">
            Donor Impact <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Honoring restaurants, caterers, and organizations leading the fight against hunger and carbon emissions.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-12 space-y-8">
            <CardSkeleton count={3} />
            <TableSkeleton rows={8} cols={5} />
          </div>
        ) : donors.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="No donation data available yet"
              description="Be the first donor to list meals and appear on the leaderboard!"
              actionText="Make a Donation"
              actionLink="/donor/donations/create"
            />
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[26px] border border-emerald-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Top Donor</div>
                <div className="mt-3 text-xl font-black text-slate-900">{topDonor?.organization_name || topDonor?.name || 'N/A'}</div>
                <p className="mt-2 text-sm text-slate-500">#{topDonor?.rank || 1} this month</p>
              </div>

              <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Meals Saved</div>
                <div className="mt-3 text-3xl font-black text-emerald-700">{totalMealsSaved.toLocaleString()}</div>
                <p className="mt-2 text-sm text-emerald-600">Across all ranked donors</p>
              </div>

              <div className="rounded-[26px] border border-cyan-200 bg-cyan-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Avg. Meals</div>
                <div className="mt-3 text-3xl font-black text-cyan-700">{averageMeals.toLocaleString()}</div>
                <p className="mt-2 text-sm text-cyan-600">Per donor in the ranking</p>
              </div>

              <div className="rounded-[26px] border border-amber-200 bg-amber-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">CO2 Offset</div>
                <div className="mt-3 text-3xl font-black text-amber-700">{totalImpact.toLocaleString()}</div>
                <p className="mt-2 text-sm text-amber-600">kg of emissions avoided</p>
              </div>
            </div>

            {top3.length > 0 && (
              <div className="grid items-end gap-6 md:grid-cols-3">
                {top3.map((donor, idx) => (
                  <div
                    key={donor.id}
                    className={`rounded-[30px] border p-6 transition hover:-translate-y-1 ${
                      podiumStyles[idx] || 'border-slate-200 bg-white/85'
                    } ${idx === 0 ? 'md:order-2 md:-mt-4' : idx === 1 ? 'md:order-1' : 'md:order-3'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{medalEmojis[idx]}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                        Rank #{donor.rank}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="truncate text-xl font-black text-slate-900">
                        {donor.organization_name || donor.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {[donor.city, donor.state].filter(Boolean).join(', ') || 'India'}
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Meals Saved</div>
                        <div className="mt-2 text-2xl font-black text-emerald-700">
                          {donor.total_meals_saved.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">CO2 Offset</div>
                        <div className="mt-2 text-2xl font-black text-teal-700">
                          {donor.co2_offset_kg.toLocaleString()} <span className="text-xs font-normal">kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                      <span>Total Donations: <strong className="text-slate-900">{donor.total_donations}</strong></span>
                      <span>Delivered: <strong className="text-emerald-700">{donor.completed_deliveries}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-slate-900">Rankings #4 – #{donors.length}</h2>
                <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        <th scope="col" className="px-6 py-4">Rank</th>
                        <th scope="col" className="px-6 py-4">Donor / Organization</th>
                        <th scope="col" className="px-6 py-4">Location</th>
                        <th scope="col" className="px-6 py-4 text-emerald-700">Meals Saved</th>
                        <th scope="col" className="px-6 py-4 text-teal-700">CO2 Offset</th>
                        <th scope="col" className="px-6 py-4 text-right">Deliveries</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rest.map((donor) => (
                        <tr key={donor.id} className="transition hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-500">#{donor.rank}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{donor.organization_name || donor.name}</div>
                            <div className="text-xs text-slate-500">{donor.total_donations} food listings</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {[donor.city, donor.state].filter(Boolean).join(', ') || 'India'}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-700">
                            {donor.total_meals_saved.toLocaleString()} meals
                          </td>
                          <td className="px-6 py-4 font-semibold text-teal-700">
                            {donor.co2_offset_kg.toLocaleString()} kg
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-700">
                            {donor.completed_deliveries}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

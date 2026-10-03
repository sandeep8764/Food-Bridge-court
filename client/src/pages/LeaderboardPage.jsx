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
    'border-amber-400/40 bg-gradient-to-b from-amber-500/10 to-slate-900/60 shadow-amber-500/10',
    'border-slate-300/40 bg-gradient-to-b from-slate-400/10 to-slate-900/60 shadow-slate-300/10',
    'border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-slate-900/60 shadow-amber-700/10'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            🏆 Community Champions
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Donor Impact <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Honoring restaurants, caterers, and organizations leading the fight against hunger and carbon emissions.
          </p>
        </div>

        {error && (
          <div className="mt-6 mx-auto max-w-xl rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-center text-sm text-rose-300">
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
          <div className="mt-12 space-y-12">
            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3 items-end">
                {top3.map((donor, idx) => (
                  <div
                    key={donor.id}
                    className={`rounded-3xl border p-6 backdrop-blur-md shadow-2xl transition transform hover:-translate-y-1 ${
                      podiumStyles[idx] || 'border-slate-800 bg-slate-900/60'
                    } ${idx === 0 ? 'md:order-2 md:-mt-4' : idx === 1 ? 'md:order-1' : 'md:order-3'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{medalEmojis[idx]}</span>
                      <span className="rounded-full bg-slate-950/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-300 border border-slate-800">
                        Rank #{donor.rank}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-xl font-bold text-white truncate">
                        {donor.organization_name || donor.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {[donor.city, donor.state].filter(Boolean).join(', ') || 'India'}
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meals Saved</div>
                        <div className="text-2xl font-black text-emerald-400">
                          {donor.total_meals_saved.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CO2 Offset</div>
                        <div className="text-2xl font-black text-teal-400">
                          {donor.co2_offset_kg.toLocaleString()} <span className="text-xs font-normal">kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Total Donations: <strong className="text-white">{donor.total_donations}</strong></span>
                      <span>Delivered: <strong className="text-emerald-400">{donor.completed_deliveries}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rest of the Table */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Rankings #4 – #{donors.length}</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-slate-800 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th scope="col" className="px-6 py-4">Rank</th>
                        <th scope="col" className="px-6 py-4">Donor / Organization</th>
                        <th scope="col" className="px-6 py-4">Location</th>
                        <th scope="col" className="px-6 py-4 text-emerald-400">Meals Saved</th>
                        <th scope="col" className="px-6 py-4 text-teal-400">CO2 Offset</th>
                        <th scope="col" className="px-6 py-4 text-right">Deliveries</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rest.map((donor) => (
                        <tr key={donor.id} className="hover:bg-slate-850/50 transition">
                          <td className="px-6 py-4 font-bold text-slate-400">
                            #{donor.rank}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{donor.organization_name || donor.name}</div>
                            <div className="text-xs text-slate-500">{donor.total_donations} food listings</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {[donor.city, donor.state].filter(Boolean).join(', ') || 'India'}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-400">
                            {donor.total_meals_saved.toLocaleString()} meals
                          </td>
                          <td className="px-6 py-4 font-semibold text-teal-400">
                            {donor.co2_offset_kg.toLocaleString()} kg
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-300">
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

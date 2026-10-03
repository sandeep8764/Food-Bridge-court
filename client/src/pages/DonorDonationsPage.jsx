import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DonationTable from '../components/DonationTable';
import { listDonations } from '../services/donationApi';

export default function DonorDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDonations() {
      try {
        const response = await listDonations({ page: 1, limit: 20 });
        setDonations(response.data.data);
        setPagination(response.data.pagination);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load donations');
      } finally {
        setLoading(false);
      }
    }

    loadDonations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Donations</h1>
            <p className="text-slate-400">Create, review, update, and cancel your available donations.</p>
          </div>
          <Link to="/donor/donations/create" className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">Create Donation</Link>
        </div>

        {loading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">Loading...</div>}
        {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">{error}</div>}
        {!loading && !error && <DonationTable donations={donations} />}

        {pagination && <p className="mt-4 text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages} • {pagination.total} total donations</p>}
      </main>
    </div>
  );
}

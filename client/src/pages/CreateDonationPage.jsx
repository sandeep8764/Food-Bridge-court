import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DonationForm from '../components/DonationForm';
import MapLoaderMessage from '../components/MapLoaderMessage';
import { createDonation } from '../services/donationApi';

export default function CreateDonationPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const onSubmit = async (values) => {
    setError('');
    try {
      const response = await createDonation(values);
      navigate(`/donor/donations/${response.data.data.donation.id}`);
    } catch (submissionError) {
      setError(submissionError?.response?.data?.message || 'Unable to create donation');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-emerald-100 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            New listing
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">Create Donation</h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">List surplus food so nearby NGOs, shelters, and volunteers can claim and deliver it quickly.</p>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        )}

        <div className="mt-6">
          <MapLoaderMessage message="Map integration is not configured. Coordinates can still be entered manually." />
        </div>

        <div className="mt-6 rounded-[30px] border border-slate-200 bg-white/85 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
          <DonationForm onSubmit={onSubmit} submitLabel="Publish Donation" />
        </div>
      </main>
    </div>
  );
}

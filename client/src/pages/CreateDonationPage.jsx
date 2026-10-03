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
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">Create Donation</h1>
        <p className="mt-2 text-slate-400">List surplus food so nearby NGOs and shelters can claim it.</p>
        {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}
        <div className="mt-6">
          <MapLoaderMessage message="Map integration is not configured. Coordinates can still be entered manually." />
        </div>
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <DonationForm onSubmit={onSubmit} submitLabel="Publish Donation" />
        </div>
      </main>
    </div>
  );
}

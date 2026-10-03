import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DonationForm from '../components/DonationForm';
import DonationStatusBadge from '../components/DonationStatusBadge';
import GoogleMapView from '../components/GoogleMapView';
import ConfirmModal from '../components/ConfirmModal';
import { cancelDonation, claimDonation, getDonation, updateDonation } from '../services/donationApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function DonationDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Claim & Cancel Modal States
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDonation() {
      try {
        const response = await getDonation(id);
        setDonation(response.data.data.donation);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load donation');
      } finally {
        setLoading(false);
      }
    }

    loadDonation();
  }, [id]);

  const isOwner = donation && user && donation.donor_id === user.id;
  const canEdit = isOwner && donation?.status === 'AVAILABLE';
  const canClaim = donation?.status === 'AVAILABLE' && ['NGO', 'SHELTER', 'ADMIN'].includes(user?.role);

  const handleUpdate = async (values) => {
    setError('');
    try {
      const response = await updateDonation(id, values);
      setDonation(response.data.data.donation);
      setEditMode(false);
      success('Donation updated successfully.');
    } catch (submissionError) {
      const msg = submissionError?.response?.data?.message || 'Unable to update donation';
      setError(msg);
      toastError(msg);
    }
  };

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      await cancelDonation(id);
      success('Donation cancelled successfully.');
      navigate('/donor/donations');
    } catch (cancelError) {
      toastError(cancelError?.response?.data?.message || 'Unable to cancel donation');
    } finally {
      setIsSubmitting(false);
      setCancelModalOpen(false);
    }
  };

  const handleConfirmClaim = async () => {
    setIsSubmitting(true);
    try {
      const res = await claimDonation(id);
      setDonation(res.data.data.donation);
      success('Donation claimed successfully! You can now arrange pickup with a volunteer.');
      setClaimModalOpen(false);
    } catch (claimErr) {
      toastError(claimErr?.response?.data?.message || 'Failed to claim donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-3" />
          <p>Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-300">
            {error || 'Donation not found'}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:text-white"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">{donation.food_name}</h1>
              <DonationStatusBadge status={donation.status} />
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Donation #{donation.id} • Posted by <strong className="text-slate-200">{donation.donor_organization_name || donation.donor_name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canClaim && (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition"
              >
                Claim This Donation
              </button>
            )}

            {canEdit && !editMode && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
                >
                  Edit Listing
                </button>
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                >
                  Cancel Donation
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Overview details grid */}
        {!editMode && (
          <section className="mt-8 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Food Category" value={donation.food_category} />
            <Info label="Quantity" value={`${donation.quantity} ${donation.quantity_unit}`} />
            <Info label="Estimated Meals" value={`~${donation.estimated_meals} meals`} highlight />
            <Info label="Expiry Date" value={donation.expiry_time ? new Date(donation.expiry_time).toLocaleString() : 'N/A'} />
            <Info
              label="Pickup Window"
              value={`${donation.pickup_start_time ? new Date(donation.pickup_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'} - ${donation.pickup_end_time ? new Date(donation.pickup_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}`}
            />
            <Info label="City / Region" value={`${donation.city || ''}, ${donation.state || ''}`} />

            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl bg-slate-950/70 p-4 border border-slate-800/60">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Pickup Address</p>
              <p className="mt-1 text-sm text-slate-200">{donation.address}</p>
            </div>

            {donation.description && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-2xl bg-slate-950/70 p-4 border border-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Description / Handling Notes</p>
                <p className="mt-1 text-sm text-slate-200">{donation.description}</p>
              </div>
            )}
          </section>
        )}

        {/* Map View */}
        {!editMode && donation?.latitude && donation?.longitude && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
            <h2 className="text-xl font-bold">Pickup Location Map</h2>
            <p className="mt-1 text-xs text-slate-400">Interactive map view showing pickup coordinates.</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
              <GoogleMapView
                markers={[
                  {
                    id: donation.id,
                    latitude: donation.latitude,
                    longitude: donation.longitude,
                    title: donation.food_name,
                    food_name: donation.food_name,
                    food_category: donation.food_category,
                    quantity: donation.quantity,
                    estimated_meals: donation.estimated_meals,
                    expiry_time: donation.expiry_time,
                    status: donation.status
                  }
                ]}
                center={{ lat: Number(donation.latitude), lng: Number(donation.longitude) }}
                zoom={14}
                fallbackMessage="Map integration is not configured."
              />
            </div>
          </section>
        )}

        {/* Edit Form */}
        {editMode && canEdit && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-bold">Edit Food Donation</h2>
              <button
                onClick={() => setEditMode(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Cancel Editing
              </button>
            </div>
            <DonationForm
              initialValues={{
                food_name: donation.food_name || '',
                food_category: donation.food_category || 'Cooked Meals',
                description: donation.description || '',
                quantity: donation.quantity || '',
                quantity_unit: donation.quantity_unit || '',
                estimated_meals: donation.estimated_meals || '',
                preparation_time: donation.preparation_time ? donation.preparation_time.slice(0, 16) : '',
                expiry_time: donation.expiry_time ? donation.expiry_time.slice(0, 16) : '',
                pickup_start_time: donation.pickup_start_time ? donation.pickup_start_time.slice(0, 16) : '',
                pickup_end_time: donation.pickup_end_time ? donation.pickup_end_time.slice(0, 16) : '',
                address: donation.address || '',
                city: donation.city || '',
                state: donation.state || '',
                latitude: donation.latitude || '',
                longitude: donation.longitude || '',
                image_url: donation.image_url || ''
              }}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
            />
          </section>
        )}
      </main>

      {/* Claim Modal */}
      <ConfirmModal
        isOpen={claimModalOpen}
        title={`Claim "${donation.food_name}"?`}
        message={`By claiming this donation, your organization commits to receiving and distributing approximately ${donation.estimated_meals} meals (${donation.quantity} ${donation.quantity_unit}) before expiry.`}
        confirmText="Confirm Claim"
        confirmVariant="primary"
        isLoading={isSubmitting}
        onConfirm={handleConfirmClaim}
        onCancel={() => setClaimModalOpen(false)}
      />

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title={`Cancel Donation "${donation.food_name}"?`}
        message="Are you sure you want to cancel this listing? This will remove the listing from available community searches."
        confirmText="Cancel Donation"
        confirmVariant="danger"
        isLoading={isSubmitting}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}

function Info({ label, value, highlight = false }) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800/60">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className={`mt-1 text-sm font-medium ${highlight ? 'text-emerald-400 font-bold' : 'text-slate-100'}`}>
        {value}
      </p>
    </div>
  );
}

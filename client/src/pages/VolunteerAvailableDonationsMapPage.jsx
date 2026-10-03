import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GoogleMapView from '../components/GoogleMapView';
import { listDonations } from '../services/donationApi';

export default function VolunteerAvailableDonationsMapPage() {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDonations() {
      try {
        const response = await listDonations({ status: 'AVAILABLE', limit: 100, page: 1 });
        setDonations(response.data.data);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load donation locations');
      }
    }

    loadDonations();
  }, []);

  const markers = donations
    .filter((donation) => Number.isFinite(Number(donation.latitude)) && Number.isFinite(Number(donation.longitude)))
    .map((donation) => ({
      id: donation.id,
      latitude: donation.latitude,
      longitude: donation.longitude,
      title: donation.food_name,
      food_name: donation.food_name,
      food_category: donation.food_category,
      quantity: donation.quantity,
      quantity_unit: donation.quantity_unit,
      estimated_meals: donation.estimated_meals,
      expiry_time: donation.expiry_time,
      status: donation.status,
      address: donation.address
    }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Available Donations Map</h1>
            <p className="mt-2 text-slate-400">View available pickup locations and open donation details from the map.</p>
          </div>
          <Link to="/volunteer/tasks" className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200">My Tasks</Link>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <GoogleMapView
            markers={markers}
            currentLocation
            fallbackMessage="Map integration is not configured."
            onMarkerClick={(marker) => {
              navigate(`/donor/donations/${marker.id}`);
            }}
            infoWindowContent={(marker) => `
              <div style="min-width:220px">
                <strong>${marker.food_name}</strong><br />
                <span>${marker.food_category}</span><br />
                <span>Quantity: ${marker.quantity} ${marker.quantity_unit}</span><br />
                <span>Estimated meals: ${marker.estimated_meals}</span><br />
                <span>Expiry: ${marker.expiry_time ? new Date(marker.expiry_time).toLocaleString() : 'N/A'}</span><br />
                <span>Status: ${marker.status}</span>
              </div>
            `}
          />
        </section>
      </main>
    </div>
  );
}
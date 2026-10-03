import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GoogleMapView from '../components/GoogleMapView';
import DonationStatusBadge from '../components/DonationStatusBadge';
import { listNearbyDonations } from '../services/donationApi';

const ALLOWED_RADII = [1, 5, 10, 20, 50];

export default function NearbyDonationsPage() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Location access is unavailable in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setLocationError('Location permission denied. Enable location access to find nearby donations.');
      }
    );
  }, []);

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    let active = true;

    async function loadNearbyDonations() {
      setLoading(true);
      setError('');

      try {
        const response = await listNearbyDonations({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius,
          page,
          limit: 12
        });

        if (!active) {
          return;
        }

        setDonations(response.data.data);
        setPagination(response.data.pagination);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError?.response?.data?.message || 'Unable to load nearby donations');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadNearbyDonations();

    return () => {
      active = false;
    };
  }, [page, radius, userLocation]);

  const markers = useMemo(() => donations.map((donation) => ({
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
    distance_km: donation.distance_km
  })), [donations]);

  const handleRadiusChange = (event) => {
    setRadius(Number(event.target.value));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Nearby Donations</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Find donations near your current location. Results are filtered on the backend and prioritized by expiry urgency, then distance.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/volunteer/dashboard" className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200">Back to Dashboard</Link>
          </div>
        </div>

        <section className="mt-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <label className="block space-y-1">
              <span className="text-sm text-slate-300">Radius</span>
              <select value={radius} onChange={handleRadiusChange} className="input max-w-xs">
                {ALLOWED_RADII.map((value) => <option key={value} value={value}>{value} km</option>)}
              </select>
            </label>
            <p className="mt-3 text-sm text-slate-400">Location access is required to search nearby donations. The map will still show a friendly message if permission is denied.</p>
            {locationError && <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">{locationError}</div>}
            {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">How results are ranked</p>
            <ul className="mt-2 space-y-2">
              <li>1. Donations expiring sooner appear first.</li>
              <li>2. Donations at the same urgency are ordered by distance.</li>
              <li>3. Only available donations inside the selected radius are returned.</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <GoogleMapView
            markers={markers}
            currentLocationPosition={userLocation}
            fallbackMessage="Map integration is not configured."
            onMarkerClick={(marker) => navigate(`/donor/donations/${marker.id}`)}
            infoWindowContent={(marker) => `
              <div style="min-width:220px">
                <strong>${marker.food_name}</strong><br />
                <span>${marker.food_category}</span><br />
                <span>Distance: ${Number(marker.distance_km || 0).toFixed(1)} km</span><br />
                <span>Quantity: ${marker.quantity} ${marker.quantity_unit}</span><br />
                <span>Estimated meals: ${marker.estimated_meals}</span><br />
                <span>Status: ${marker.status}</span>
              </div>
            `}
          />
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Nearby Donations</h2>
            {pagination && <p className="text-sm text-slate-400">Page {pagination.page} of {pagination.totalPages} • {pagination.total} total</p>}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">Loading nearby donations...</div>
          ) : donations.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">No donations found within the selected radius.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {donations.map((donation) => (
                <article key={donation.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{donation.food_name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{donation.address}</p>
                    </div>
                    <DonationStatusBadge status={donation.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                    <Stat label="Distance" value={`${Number(donation.distance_km || 0).toFixed(1)} km`} />
                    <Stat label="Expiry" value={donation.expiry_time ? new Date(donation.expiry_time).toLocaleString() : 'N/A'} />
                    <Stat label="Quantity" value={`${donation.quantity} ${donation.quantity_unit}`} />
                    <Stat label="Meals" value={donation.estimated_meals} />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">{donation.food_category}</p>
                    <Link to={`/donor/donations/${donation.id}`} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Claim</Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))} className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-200 disabled:opacity-50">Previous</button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages))} className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-200 disabled:opacity-50">Next</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
  );
}
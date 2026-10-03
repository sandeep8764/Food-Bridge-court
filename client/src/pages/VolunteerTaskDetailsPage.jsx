import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RouteMap from '../components/RouteMap';
import TaskStatusBadge from '../components/TaskStatusBadge';
import TaskTimeline from '../components/TaskTimeline';
import { acceptTask, deliverTask, getTask, pickupTask } from '../services/taskApi';

export default function VolunteerTaskDetailsPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    async function loadTask() {
      try {
        const response = await getTask(id);
        setTask(response.data.data.task);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load task');
      }
    }

    loadTask();
  }, [id]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage('Current location is unavailable in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setLocationMessage('Location permission denied. Route details will still load for pickup and destination.');
      }
    );
  }, []);

  const canAccept = task?.status === 'ASSIGNED';
  const canPickup = task?.status === 'ACCEPTED';
  const canDeliver = task?.status === 'PICKED_UP';

  const refreshTask = async () => {
    const response = await getTask(id);
    setTask(response.data.data.task);
  };

  const handleAction = async (action) => {
    setError('');
    try {
      if (action === 'accept') await acceptTask(id);
      if (action === 'pickup') await pickupTask(id);
      if (action === 'deliver') await deliverTask(id);
      await refreshTask();
    } catch (submissionError) {
      setError(submissionError?.response?.data?.message || 'Action failed');
    }
  };

  const buttons = useMemo(() => [
    canAccept && { label: 'Accept Task', action: 'accept' },
    canPickup && { label: 'Mark Picked Up', action: 'pickup' },
    canDeliver && { label: 'Mark Delivered', action: 'deliver' }
  ].filter(Boolean), [canAccept, canPickup, canDeliver]);

  const pickupRouteTarget = task?.pickup_address ? [task.pickup_address, task.pickup_city, task.pickup_state].filter(Boolean).join(', ') : null;
  const destinationRouteTarget = task?.ngo_address ? [task.ngo_address, task.ngo_city, task.ngo_state].filter(Boolean).join(', ') : null;

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-10">{error || 'Loading...'}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{task.food_name}</h1>
            <p className="mt-2 text-slate-400">Task #{task.id}</p>
          </div>
          <TaskStatusBadge status={task.status} />
        </div>

        {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}
        {locationMessage && <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">{locationMessage}</div>}

        <section className="mt-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-2">
          <Info label="Pickup Location" value={task.pickup_address} />
          <Info label="Destination" value={task.ngo_organization_name || task.donor_organization_name || 'N/A'} />
          <Info label="Food" value={task.food_name} />
          <Info label="Quantity" value={`${task.quantity} ${task.quantity_unit}`} />
          <Info label="Expiry" value={task.expiry_time ? new Date(task.expiry_time).toLocaleString() : 'N/A'} />
          <Info label="Volunteer" value={task.volunteer_name || 'Unassigned'} />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Route</h2>
          <p className="mt-1 text-slate-400">Pickup location to destination route for the current volunteer task.</p>
          <div className="mt-4">
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Volunteer to pickup</p>
                {currentLocation ? <RouteMap origin={currentLocation} destination={pickupRouteTarget} className="w-full" /> : <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-slate-300">Waiting for current location...</div>}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Pickup to NGO / Shelter</p>
                {pickupRouteTarget && destinationRouteTarget ? <RouteMap origin={pickupRouteTarget} destination={destinationRouteTarget} className="w-full" /> : <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-slate-300">Route destination details are unavailable.</div>}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          {buttons.map((button) => (
            <button key={button.action} onClick={() => handleAction(button.action)} className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">
              {button.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <TaskTimeline task={task} />
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-slate-100">{value || 'N/A'}</p>
    </div>
  );
}

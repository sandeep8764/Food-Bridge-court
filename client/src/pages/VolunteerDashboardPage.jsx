import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { Link } from 'react-router-dom';

export default function VolunteerDashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data.data);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load tasks');
      }
    }

    loadTasks();
  }, []);

  const activeTasks = tasks.filter((task) => task.status !== 'DELIVERED' && task.status !== 'CANCELLED');
  const completedTasks = tasks.filter((task) => task.status === 'DELIVERED');
  const totalMealsDelivered = completedTasks.reduce((sum, task) => sum + Number(task.estimated_meals || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
        <p className="mt-2 text-slate-400">Track pickup tasks, active deliveries, and your delivery history.</p>
        <div className="mt-4">
          <Link to="/nearby-donations" className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200">View Nearby Donations</Link>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Active Tasks" value={activeTasks.length} />
          <StatCard label="Completed Deliveries" value={completedTasks.length} />
          <StatCard label="Total Meals Delivered" value={totalMealsDelivered} />
        </div>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Your Tasks</h2>
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">No tasks assigned yet.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} actionTo={`/volunteer/tasks/${task.id}`} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-emerald-400">{value ?? 0}</p>
    </div>
  );
}

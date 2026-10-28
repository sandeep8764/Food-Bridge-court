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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fffb_0%,#f3f7f4_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-amber-100 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
            Volunteer portal
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">Volunteer Dashboard</h1>
          <p className="mt-2 text-base text-slate-600">Track pickup tasks, active deliveries, and your delivery history.</p>
        </div>

        <div className="mt-5">
          <Link to="/nearby-donations" className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">View Nearby Donations</Link>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Active Tasks" value={activeTasks.length} />
          <StatCard label="Completed Deliveries" value={completedTasks.length} />
          <StatCard label="Total Meals Delivered" value={totalMealsDelivered} />
        </div>

        <section className="mt-8 space-y-4 rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-bold text-slate-900">Your Tasks</h2>
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">No tasks assigned yet.</div>
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
    <div className="rounded-[24px] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-emerald-700">{value ?? 0}</p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import TaskCard from '../components/TaskCard';

export default function VolunteerTasksPage() {
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="mt-2 text-slate-400">Accept pickups, mark collected food, and complete deliveries.</p>
        {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} actionTo={`/volunteer/tasks/${task.id}`} />
          ))}
        </div>
      </main>
    </div>
  );
}

const statusClasses = {
  ASSIGNED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  ACCEPTED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PICKED_UP: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30'
};

export default function TaskStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status] || statusClasses.CANCELLED}`}>
      {status}
    </span>
  );
}

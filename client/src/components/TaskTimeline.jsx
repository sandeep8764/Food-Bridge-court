export default function TaskTimeline({ task }) {
  const steps = [
    { label: 'Assigned', value: task.assigned_at },
    { label: 'Accepted', value: task.accepted_at },
    { label: 'Picked Up', value: task.picked_up_at },
    { label: 'Delivered', value: task.delivered_at }
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-lg font-semibold">Task Timeline</h3>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center justify-between rounded-xl bg-slate-950/70 px-4 py-3 text-sm">
            <span className="text-slate-300">{step.label}</span>
            <span className="text-slate-500">{step.value ? new Date(step.value).toLocaleString() : 'Pending'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

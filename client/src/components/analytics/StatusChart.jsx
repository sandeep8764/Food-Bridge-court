import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#14b8a6', '#8b5cf6', '#ef4444', '#64748b'];

export default function StatusChart({ data = [] }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/40">
      <h3 className="text-lg font-semibold text-white">Status Analytics</h3>
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={80} outerRadius={120} paddingAngle={4}>
              {data.map((entry, index) => <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
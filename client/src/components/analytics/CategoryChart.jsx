import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'];

export default function CategoryChart({ data = [] }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/40">
      <h3 className="text-lg font-semibold text-white">Category Analytics</h3>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_260px] xl:items-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip />
            <Pie data={data} dataKey="donation_count" nameKey="food_category" innerRadius={70} outerRadius={110} paddingAngle={3}>
              {data.map((entry, index) => <Cell key={entry.food_category} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-3">
          {data.map((entry, index) => (
            <div key={entry.food_category} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="font-medium text-slate-100">{entry.food_category}</p>
              <p className="text-sm text-slate-400">Donations: {entry.donation_count}</p>
              <p className="text-sm text-slate-400">Meals saved: {entry.meals_saved}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (Number(entry.donation_count) / Math.max(1, data[0]?.donation_count || 1)) * 100)}%`, backgroundColor: COLORS[index % COLORS.length] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
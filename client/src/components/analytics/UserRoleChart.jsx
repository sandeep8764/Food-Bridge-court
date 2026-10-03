import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const ROLE_COLORS = {
  DONOR: '#10b981', // emerald
  NGO: '#06b6d4',   // cyan
  SHELTER: '#8b5cf6', // violet
  VOLUNTEER: '#f59e0b', // amber
  ADMIN: '#f43f5e'   // rose
};

export default function UserRoleChart({ data = [] }) {
  const chartData = data.map((item) => ({
    name: item.role,
    value: Number(item.count || 0),
    color: ROLE_COLORS[item.role] || '#94a3b8'
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Users by Role</h3>
          <p className="text-xs text-slate-400">Total registered community members: {total}</p>
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#fff'
              }}
              formatter={(value, name) => [`${value} users`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

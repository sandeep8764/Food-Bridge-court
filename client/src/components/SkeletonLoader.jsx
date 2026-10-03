import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="mt-3 h-8 w-16 rounded bg-slate-700" />
          <div className="mt-2 h-3 w-32 rounded bg-slate-800/80" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex gap-4 border-b border-slate-800 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-800" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2.5">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded bg-slate-800/60" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="h-5 w-48 rounded bg-slate-800" />
      <div className="mt-2 h-4 w-64 rounded bg-slate-800/60" />
      <div className="mt-8 h-64 rounded-xl bg-slate-800/40 flex items-end justify-around p-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-full bg-slate-700/50 rounded-t"
            style={{ height: `${20 + ((i * 13) % 70)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

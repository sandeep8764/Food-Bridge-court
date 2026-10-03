export default function AnalyticsCards({ cards = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/40">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{card.value ?? 0}</p>
          {card.helper && <p className="mt-2 text-sm text-slate-500">{card.helper}</p>}
        </div>
      ))}
    </div>
  );
}
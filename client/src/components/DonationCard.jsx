import { Link } from 'react-router-dom';
import DonationStatusBadge from './DonationStatusBadge';

export default function DonationCard({ donation, actionLabel = 'View Details', actionTo = '#' }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">{donation.food_name}</h3>
          <p className="mt-1 text-sm text-slate-400">{donation.food_category} • {donation.city || donation.state || 'Location not specified'}</p>
        </div>
        <DonationStatusBadge status={donation.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <Info label="Quantity" value={`${donation.quantity} ${donation.quantity_unit}`} />
        <Info label="Meals" value={donation.estimated_meals} />
        <Info label="Expiry" value={donation.expiry_time ? new Date(donation.expiry_time).toLocaleString() : 'N/A'} />
        <Info label="Address" value={donation.address || 'N/A'} />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-400">{donation.description}</p>
        <Link to={actionTo} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950/70 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
  );
}

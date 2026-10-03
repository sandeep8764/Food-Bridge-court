import { Link } from 'react-router-dom';
import DonationStatusBadge from './DonationStatusBadge';

export default function DonationTable({ donations = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-950 text-slate-400">
          <tr>
            <Th>Food</Th>
            <Th>Category</Th>
            <Th>Quantity</Th>
            <Th>Meals</Th>
            <Th>Status</Th>
            <Th>Updated</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {donations.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>No donations found.</td>
            </tr>
          ) : donations.map((donation) => (
            <tr key={donation.id}>
              <Td>{donation.food_name}</Td>
              <Td>{donation.food_category}</Td>
              <Td>{donation.quantity} {donation.quantity_unit}</Td>
              <Td>{donation.estimated_meals}</Td>
              <Td><DonationStatusBadge status={donation.status} /></Td>
              <Td>{donation.updated_at ? new Date(donation.updated_at).toLocaleString() : 'N/A'}</Td>
              <Td><Link to={`/donor/donations/${donation.id}`} className="text-emerald-400">Open</Link></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}

function Td({ children }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}

export default function MapLoaderMessage({ message = 'Map integration is not configured.' }) {
  return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">{message}</div>;
}
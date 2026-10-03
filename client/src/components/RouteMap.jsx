import { useEffect, useId, useMemo, useState } from 'react';

let routeLoaderPromise = null;

function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined' || !apiKey) {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!routeLoaderPromise) {
    routeLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google?.maps || null);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return routeLoaderPromise;
}

export default function RouteMap({ origin, destination, className = '', height = '360px' }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = useId();
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const originValue = useMemo(() => normalizeRoutePoint(origin), [origin]);
  const destinationValue = useMemo(() => normalizeRoutePoint(destination), [destination]);

  useEffect(() => {
    if (!apiKey || !originValue || !destinationValue) {
      return;
    }

    let map;
    let directionsRenderer;
    let isMounted = true;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!maps || !isMounted) {
          return;
        }

        const container = document.getElementById(mapId);
        if (!container) {
          return;
        }

        map = new maps.Map(container, {
          center: originPoint,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        directionsRenderer = new maps.DirectionsRenderer({ map, suppressMarkers: false });
        const directionsService = new maps.DirectionsService();

        directionsService.route(
          {
            origin: originValue,
            destination: destinationValue,
            travelMode: maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === 'OK' && result) {
              directionsRenderer.setDirections(result);
              const leg = result.routes?.[0]?.legs?.[0];
              setRoute({
                distance: leg?.distance?.text || 'N/A',
                duration: leg?.duration?.text || 'N/A'
              });
            } else {
              setError('Unable to load route directions.');
            }
          }
        );
      })
      .catch(() => setError('Map integration is not configured.'));

    return () => {
      isMounted = false;
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
      if (map) {
        map = null;
      }
    };
  }, [apiKey, destinationValue, originValue]);

  if (!apiKey) {
    return <div className={`rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300 ${className}`}>Map integration is not configured.</div>;
  }

  if (!originValue || !destinationValue) {
    return <div className={`rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300 ${className}`}>Invalid coordinates for route map.</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}
      <div id={mapId} style={{ height }} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900" />
      {route && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Distance" value={route.distance} />
          <Metric label="Estimated Time" value={route.duration} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function normalizeRoutePoint(point) {
  if (!point) {
    return null;
  }

  if (typeof point === 'string' && point.trim()) {
    return point.trim();
  }

  if (Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng))) {
    return { lat: Number(point.lat), lng: Number(point.lng) };
  }

  if (point.address || point.label) {
    return String(point.address || point.label).trim();
  }

  return null;
}
import { useEffect, useId, useMemo, useState } from 'react';

let googleMapsLoaderPromise = null;

function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined' || !apiKey) {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!googleMapsLoaderPromise) {
    googleMapsLoaderPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-maps="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google?.maps || null), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.dataset.googleMaps = 'true';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google?.maps || null);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleMapsLoaderPromise;
}

function normalizeMarkers(markers = []) {
  return markers.filter((marker) => Number.isFinite(Number(marker.latitude)) && Number.isFinite(Number(marker.longitude)));
}

export default function GoogleMapView({
  markers = [],
  center,
  zoom = 12,
  className = '',
  currentLocation = false,
  currentLocationPosition,
  onCurrentLocationChange,
  onCurrentLocationError,
  onMarkerClick,
  selectedMarkerId,
  infoWindowContent,
  fallbackMessage = 'Map integration is not configured.',
  height = '400px'
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = useId();
  const validMarkers = useMemo(() => normalizeMarkers(markers), [markers]);
  const [mapError, setMapError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [location, setLocation] = useState(null);
  const resolvedCurrentLocation = currentLocationPosition || location;

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let map;
    let markerInstances = [];
    let infoWindow;
    const container = document.getElementById(mapId);

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!maps || !container) {
          return;
        }

        const mapCenter = center || resolvedCurrentLocation || (validMarkers[0] ? { lat: Number(validMarkers[0].latitude), lng: Number(validMarkers[0].longitude) } : { lat: 20.5937, lng: 78.9629 });
        map = new maps.Map(container, {
          center: mapCenter,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        infoWindow = new maps.InfoWindow();

        markerInstances = validMarkers.map((marker) => {
          const mapMarker = new maps.Marker({
            position: { lat: Number(marker.latitude), lng: Number(marker.longitude) },
            map,
            title: marker.title || marker.food_name || marker.label || 'Location'
          });

          mapMarker.addListener('click', () => {
            onMarkerClick?.(marker, map);
            if (infoWindowContent) {
              infoWindow.setContent(typeof infoWindowContent === 'function' ? infoWindowContent(marker) : infoWindowContent);
              infoWindow.open({ anchor: mapMarker, map });
            }
          });

          if (selectedMarkerId && marker.id === selectedMarkerId && infoWindowContent) {
            infoWindow.setContent(typeof infoWindowContent === 'function' ? infoWindowContent(marker) : infoWindowContent);
            infoWindow.open({ anchor: mapMarker, map });
          }

          return mapMarker;
        });

        if (resolvedCurrentLocation) {
          new maps.Marker({
            position: resolvedCurrentLocation,
            map,
            title: 'Your current location',
            icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
        }

        if (currentLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const nextLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setLocation(nextLocation);
              onCurrentLocationChange?.(nextLocation);
              new maps.Marker({
                position: nextLocation,
                map,
                title: 'Your current location',
                icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              });
            },
            () => {
              setLocationError('Location permission denied. You can still view the map.');
              onCurrentLocationError?.('Location permission denied. Enable access to see nearby donations around you.');
            }
          );
        }

        setMapReady(true);
      })
      .catch(() => setMapError('Map integration is not configured.'));

    return () => {
      markerInstances.forEach((marker) => marker.setMap(null));
      if (infoWindow) {
        infoWindow.close();
      }
      if (map) {
        map = null;
      }
    };
  }, [apiKey, center, currentLocation, currentLocationPosition, infoWindowContent, onCurrentLocationChange, onMarkerClick, resolvedCurrentLocation, selectedMarkerId, validMarkers, zoom]);

  if (!apiKey) {
    return <div className={`rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300 ${className}`}>{fallbackMessage}</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {mapError && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{mapError}</div>}
      {locationError && <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">{locationError}</div>}
      <div id={mapId} style={{ height }} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900" />
      {!mapReady && !mapError && <p className="text-sm text-slate-400">Loading map...</p>}
      {location && <p className="text-sm text-slate-400">Current location detected.</p>}
    </div>
  );
}
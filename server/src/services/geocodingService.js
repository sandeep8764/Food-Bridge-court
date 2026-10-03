export async function geocodeAddress(address, options = {}) {
  const apiKey = options.apiKey ?? process.env.GOOGLE_MAPS_API_KEY;
  const fetchImpl = options.fetchImpl ?? fetch;
  const normalizedAddress = String(address || '').trim();

  if (!normalizedAddress || !apiKey) {
    return null;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', normalizedAddress);
    url.searchParams.set('key', apiKey);

    const response = await fetchImpl(url);
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const result = payload?.results?.[0];
    const location = result?.geometry?.location;

    if (payload?.status !== 'OK' || typeof location?.lat !== 'number' || typeof location?.lng !== 'number') {
      return null;
    }

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address || normalizedAddress
    };
  } catch {
    return null;
  }
}
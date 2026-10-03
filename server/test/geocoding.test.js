import test from 'node:test';
import assert from 'node:assert/strict';

const { geocodeAddress } = await import('../src/services/geocodingService.js');

test('geocodeAddress returns null when the API key is missing', async () => {
  const result = await geocodeAddress('Delhi, India', { apiKey: '' });
  assert.equal(result, null);
});

test('geocodeAddress returns coordinates from Google response payload', async () => {
  const result = await geocodeAddress('Delhi, India', {
    apiKey: 'test-key',
    fetchImpl: async () => ({
      ok: true,
      async json() {
        return {
          status: 'OK',
          results: [
            {
              formatted_address: 'Delhi, India',
              geometry: {
                location: {
                  lat: 28.6139,
                  lng: 77.209
                }
              }
            }
          ]
        };
      }
    })
  });

  assert.deepEqual(result, {
    latitude: 28.6139,
    longitude: 77.209,
    formattedAddress: 'Delhi, India'
  });
});

test('geocodeAddress returns null for invalid coordinates payloads', async () => {
  const result = await geocodeAddress('Invalid Place', {
    apiKey: 'test-key',
    fetchImpl: async () => ({
      ok: true,
      async json() {
        return {
          status: 'ZERO_RESULTS',
          results: []
        };
      }
    })
  });

  assert.equal(result, null);
});
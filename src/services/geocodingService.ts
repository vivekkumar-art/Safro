/**
 * SAFRO Geocoding & Place Search Service
 * Real-time place search, address autocomplete, and reverse geocoding
 */

export interface PlaceSearchResult {
  id: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
}

class GeocodingService {
  private cache: Map<string, PlaceSearchResult[]> = new Map();

  /**
   * Search for places, addresses, landmarks and cities
   */
  async searchPlaces(query: string, limit: number = 6): Promise<PlaceSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    const cacheKey = `${cleanQuery.toLowerCase()}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 1. Try Google Maps Geocoder if Google Maps API is loaded in browser
    if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const googleResults = await new Promise<PlaceSearchResult[]>((resolve) => {
          geocoder.geocode({ address: cleanQuery }, (results: any, status: any) => {
            if (status === 'OK' && Array.isArray(results) && results.length > 0) {
              const mapped: PlaceSearchResult[] = results.slice(0, limit).map((r: any, idx: number) => ({
                id: `gmap_${r.place_id || idx}`,
                name: r.formatted_address.split(',')[0],
                formattedAddress: r.formatted_address,
                latitude: r.geometry.location.lat(),
                longitude: r.geometry.location.lng(),
                category: r.types?.[0] || 'landmark',
              }));
              resolve(mapped);
            } else {
              resolve([]);
            }
          });
        });

        if (googleResults.length > 0) {
          this.cache.set(cacheKey, googleResults);
          return googleResults;
        }
      } catch {
        // Fall back seamlessly to Photon API
      }
    }

    try {
      // Use Komoot Photon API (high-speed OpenStreetMap search with fuzzy matching)
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed with status ${response.status}`);
      }

      const data = await response.json();
      const features: any[] = data.features || [];

      const results: PlaceSearchResult[] = features.map((feat, idx) => {
        const props = feat.properties || {};
        const coords = feat.geometry?.coordinates || [0, 0]; // [lon, lat]

        const name = props.name || props.street || cleanQuery;
        const addressParts = [
          props.street,
          props.city || props.town || props.village || props.district,
          props.state,
          props.country,
        ].filter(Boolean);

        const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : name;

        return {
          id: `${props.osm_id || idx}_${Date.now()}`,
          name,
          formattedAddress,
          latitude: coords[1],
          longitude: coords[0],
          category: props.osm_value || props.osm_key || 'place',
          city: props.city || props.town || props.village,
          state: props.state,
          country: props.country,
        };
      });

      this.cache.set(cacheKey, results);
      return results;
    } catch (err) {
      console.warn('Photon geocoding failed, attempting OpenStreetMap Nominatim fallback:', err);
      return this.searchNominatimFallback(cleanQuery, limit);
    }
  }

  /**
   * Fallback geocoding with OpenStreetMap Nominatim
   */
  private async searchNominatimFallback(query: string, limit: number): Promise<PlaceSearchResult[]> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SAFRO-Travel-App/1.0',
        },
      });

      if (!response.ok) throw new Error('Nominatim request failed');

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any, idx: number) => ({
        id: `nom_${item.place_id || idx}`,
        name: item.name || item.display_name?.split(',')[0] || query,
        formattedAddress: item.display_name || '',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        category: item.type || item.class || 'landmark',
      }));
    } catch (e) {
      console.warn('Geocoding completely offline or unavailable:', e);
      return [];
    }
  }

  /**
   * Reverse geocode coordinate to human-readable address name
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    // 1. Try Google Maps Reverse Geocoder if available
    if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const address = await new Promise<string | null>((resolve) => {
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any, status: any) => {
              if (status === 'OK' && results?.[0]?.formatted_address) {
                resolve(results[0].formatted_address);
              } else {
                resolve(null);
              }
            }
          );
        });
        if (address) return address;
      } catch {
        // Fall back to Nominatim
      }
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SAFRO-Travel-App/1.0',
        },
      });
      if (!response.ok) throw new Error('Reverse geocode failed');
      const data = await response.json();
      return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }
}

export const geocodingService = new GeocodingService();

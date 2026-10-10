/**
 * Google Maps JavaScript API Loader & Utilities for SAFRO
 */

declare global {
  interface Window {
    google?: any;
    __safroGoogleMapsPromise?: Promise<any>;
    __initSafroGoogleMaps?: () => void;
    gm_authFailure?: () => void;
  }
}

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAyhUn6petgm3W8rpyBZogk6K9TmU2wFv4';

/**
 * Dynamically loads the Google Maps JavaScript API script.
 * Caches the loading promise to prevent duplicate script injections.
 */
export function loadGoogleMaps(apiKey: string = GOOGLE_MAPS_API_KEY): Promise<any> {
  // If already loaded and Map constructor is ready, resolve immediately
  if (typeof window !== 'undefined' && window.google?.maps?.Map) {
    return Promise.resolve(window.google.maps);
  }

  // Return existing loader promise if already in flight
  if (typeof window !== 'undefined' && window.__safroGoogleMapsPromise) {
    return window.__safroGoogleMapsPromise;
  }

  const promise = new Promise<any>((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window is not defined'));
    }

    // Helper to resolve when Map constructor is definitely present
    const finishLoading = async () => {
      try {
        if (!window.google?.maps) {
          throw new Error('Google Maps object not found');
        }

        // If modern importLibrary is present, import maps & marker libraries
        if (typeof window.google.maps.importLibrary === 'function') {
          const mapsLib = await window.google.maps.importLibrary('maps');
          if (mapsLib?.Map && !window.google.maps.Map) {
            window.google.maps.Map = mapsLib.Map;
            window.google.maps.InfoWindow = mapsLib.InfoWindow;
          }
        }

        if (window.google.maps.Map) {
          resolve(window.google.maps);
        } else {
          // Poll briefly for Map constructor
          let count = 0;
          const poll = setInterval(() => {
            count++;
            if (window.google?.maps?.Map) {
              clearInterval(poll);
              resolve(window.google.maps);
            } else if (count > 25) {
              clearInterval(poll);
              reject(new Error('Timed out waiting for google.maps.Map constructor'));
            }
          }, 100);
        }
      } catch (e) {
        reject(e);
      }
    };

    // Trap Google Maps authentication / quota failure callback to prevent runtime breaking
    window.gm_authFailure = () => {
      console.warn('Google Maps authentication failure detected (gm_authFailure). Fallback to Leaflet basemaps.');
    };

    // Callback hook
    window.__initSafroGoogleMaps = () => {
      finishLoading().catch(reject);
    };

    // Check if script tag already exists
    const existingScript = document.querySelector('script[id="google-maps-js-sdk"]') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.maps?.Map) {
        finishLoading().catch(reject);
      } else {
        existingScript.addEventListener('load', () => finishLoading().catch(reject), { once: true });
        existingScript.addEventListener('error', (err) => reject(err), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&v=weekly&callback=__initSafroGoogleMaps`;
    script.async = true;
    script.defer = true;

    script.onerror = (error) => {
      console.warn('Google Maps failed to load from CDN. Falling back to Leaflet.', error);
      reject(error);
    };

    document.head.appendChild(script);
  });

  if (typeof window !== 'undefined') {
    window.__safroGoogleMapsPromise = promise;
  }

  return promise;
}

/**
 * Checks if the Google Maps API is loaded and available
 */
export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.google?.maps?.Map;
}

/**
 * Single shared loader for the Google Maps JS API.
 *
 * Replaces the three copy-pasted <script> injections that each carried a
 * hardcoded API key. The key now comes from VITE_GOOGLE_MAPS_API_KEY.
 *
 * NOTE: a Maps JS key is always visible in the browser. Restrict it in the
 * Google Cloud Console to your HTTP referrers and to the Maps JavaScript,
 * Places and Geocoding APIs. See README.md.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = 'places,geometry';
const SCRIPT_ID = 'google-maps-js-api';

let loaderPromise = null;

export function isGoogleMapsReady() {
  return Boolean(window.google?.maps?.places);
}

/**
 * Load the Maps API once per page. Repeat callers share the same promise.
 * @returns {Promise<typeof window.google.maps>}
 */
export function loadGoogleMaps() {
  if (isGoogleMapsReady()) return Promise.resolve(window.google.maps);

  if (!API_KEY) {
    return Promise.reject(
      new Error('VITE_GOOGLE_MAPS_API_KEY is not set. Copy .env.example to .env and add your key.')
    );
  }

  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google.maps));
        existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps API')));
        return;
      }

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        API_KEY
      )}&libraries=${LIBRARIES}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = () => {
        loaderPromise = null;
        reject(new Error('Failed to load Google Maps API'));
      };
      document.head.appendChild(script);
    });
  }

  return loaderPromise;
}

/** Promise-wrapped geocoding, so callers don't repeat the callback dance. */
export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (!address || !address.trim()) {
      reject(new Error('כתובת ריקה הוזנה'));
      return;
    }
    if (!isGoogleMapsReady()) {
      reject(new Error('שירות המפות עדיין נטען. אנא נסה שוב בעוד רגע.'));
      return;
    }

    new window.google.maps.Geocoder().geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        resolve(results[0].geometry.location);
      } else {
        reject(new Error(`לא ניתן היה למצוא את הכתובת: "${address}".`));
      }
    });
  });
}

/** Promise-wrapped Places autocomplete. */
export function fetchPlacePredictions(input) {
  return new Promise((resolve) => {
    if (!input || input.length < 2 || !isGoogleMapsReady()) {
      resolve([]);
      return;
    }

    new window.google.maps.places.AutocompleteService().getPlacePredictions({ input }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        resolve(predictions.map((p) => ({ description: p.description, place_id: p.place_id })));
      } else {
        resolve([]);
      }
    });
  });
}

/**
 * React-friendly hook helper: loads the API and reports readiness.
 * @param {(ready: boolean, error: Error|null) => void} onStateChange
 */
export function initGoogleMaps(onStateChange) {
  let cancelled = false;
  loadGoogleMaps()
    .then(() => !cancelled && onStateChange(true, null))
    .catch((error) => !cancelled && onStateChange(false, error));
  return () => {
    cancelled = true;
  };
}
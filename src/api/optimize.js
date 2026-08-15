/**
 * Route optimization API.
 *
 * Calls our own backend, which proxies to the pickup-optimizer service.
 * The optimizer's URL is now a server-side setting (OPTIMIZER_API_URL) rather
 * than a hardcoded string in the bundle.
 */

import { api } from './client';

/**
 * @param {Object}  params
 * @param {string}  params.origin              Driver's origin address
 * @param {string}  params.destination         Shared destination address
 * @param {string}  params.passengerAddress    Passenger's origin address
 * @param {boolean} [params.passengerUsesTransit=false]
 * @param {'driver'|'balanced'|'passenger'} [params.preference='driver']
 */
export function optimizeRoute({
  origin,
  destination,
  passengerAddress,
  passengerUsesTransit = false,
  preference = 'driver',
}) {
  return api.post('/optimize', {
    origin,
    destination,
    passengers: [
      {
        label: 'passenger_1',
        address: passengerAddress,
        transit_mode: passengerUsesTransit,
      },
    ],
    preference,
  });
}
/**
 * Entity APIs — the replacement for `base44.entities.*`.
 *
 * Ownership is enforced server-side (every query is scoped to the caller),
 * which is what the Base44 `rls` blocks used to do.
 */

import { api } from './client';

export const RouteHistory = {
  /**
   * @param {Object}  [options]
   * @param {string}  [options.order='-created_date']
   * @param {boolean} [options.favoritesOnly=false]
   * @param {number}  [options.limit=100]
   * @param {number}  [options.offset=0]
   */
  list({ order = '-created_date', favoritesOnly = false, limit = 100, offset = 0 } = {}) {
    const params = new URLSearchParams({
      order,
      favorites_only: String(favoritesOnly),
      limit: String(limit),
      offset: String(offset),
    });
    return api.get(`/routes?${params.toString()}`);
  },

  listFavorites(options = {}) {
    return RouteHistory.list({ ...options, favoritesOnly: true });
  },

  get(id) {
    return api.get(`/routes/${id}`);
  },

  create(data) {
    return api.post('/routes', data);
  },

  update(id, data) {
    return api.patch(`/routes/${id}`, data);
  },

  delete(id) {
    return api.delete(`/routes/${id}`);
  },
};

export const Feedback = {
  create(data) {
    return api.post('/feedback', data);
  },

  /** Admin-only. */
  list({ limit = 100, offset = 0 } = {}) {
    return api.get(`/feedback?limit=${limit}&offset=${offset}`);
  },
};
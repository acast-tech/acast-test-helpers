import { setupAsync, waitUntil } from './async';
import { setupFakeFetch, teardownFakeFetch, fetchRespond } from './fetch';

/**
 * Convenience method to set up everything needed to use fake fetch in an async environment.
 * Calls {@link setupAsync}, {@link setupFakeFetch} and {@link teardownFakeFetch}.
 *
 * Use this by calling it once on top of the appropriate `describe`.
 */
export function setupFakeFetchAsync() {
  setupAsync();

  beforeEach(setupFakeFetch);
  afterEach(teardownFakeFetch);
}


/**
 * Waits until a fetch call has been made, and resolves with the same return value as in {@link fetchRespond}.
 * @param {string} path The fetched path to wait for. Same as in {@link fetchRespond}.
 */
export function waitUntilFetchExists(path) {
  waitUntil(() => fetchRespond(path));
}

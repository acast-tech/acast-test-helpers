/*
 Acast Test Helpers
 Copyright (C) 2017 Acast AB

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 For more information about this program, or to contact the authors,
 see https://github.com/acastSthlm/acast-test-helpers
 */
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
 * @see {@link waitUntilXhrExists}
 * @example
 * waitUntilFetchExists('/api/user/1337');
 * andThen(request => {
 *   request.resolveWith(200, {
 *     id: 1337,
 *     name: 'Fire'
 *   });
 * });
 */
export function waitUntilFetchExists(path) {
  waitUntil(() => fetchRespond(path));
}

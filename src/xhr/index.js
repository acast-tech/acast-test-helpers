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
import stubber from './stubber';
import { waitUntil } from '../async';

let isFakingXhr = false;

/**
 * Replaces the real XMLHttpRequest constructor with a fake one to intercept any subsequent XHR call.
 */
export function startFakingXhr() {
  stubber.start();
  isFakingXhr = true;
}

/**
 * Restores the real XMLHttpRequest constructor to the original one that was replaced by {@link startFakingXhr}.
 */
export function stopFakingXhr() {
  if (!isFakingXhr) {
    throw new Error(
      `${stopFakingXhr.name} can only be used after call to ${startFakingXhr.name}!`
    );
  }
  stubber.reset();
  isFakingXhr = false;
}

/**
 * Finds a previously made and still unresolved XHR request.
 * @param {string} method A string representing what HTTP Method of the request to find, like 'GET' or 'POST'
 * @param {string} url The complete url, including any query string, of the request to find
 * @returns {FakeRequest|null} The matching {@link FakeRequest}, or null if no matching request was found.
 */
export function findXhr(method, url) {
  if (!isFakingXhr) {
    throw new Error(
      `${findXhr.name} can only be used between calls to ${startFakingXhr.name} and ${stopFakingXhr.name}!`
    );
  }
  return stubber.match(method, url);
}

/**
 * Asynchronous version of {@link findXhr}.
 * Waits until the matched XHR request shows up, and then passes it to the next asynchronous function.
 * If the test times out while waiting for the request to show up, a helpful error message will show which requests
 * where active.
 * @param {string} method Same as in {@link findXhr}
 * @param {string} url Same as in {@link findXhr}
 * @see {@link waitUntilFetchExists}
 *
 * @example
 * waitUntilXhrExists('GET', '/api/user/1337');
 * andThen(request => {
 *   request.respondWithJson(200, {
 *     id: 1337,
 *     name: 'Fire'
 *   });
 * });
 */
export function waitUntilXhrExists(method, url) {
  waitUntil(
    () => findXhr(method, url),
    () => createErrorMessageForXhr(method, url)
  );
}

function createErrorMessageForXhr(method, url) {
  const activeRequests = stubber.requests.filter(
    request => request.readyState === 1
  );

  const dedupedActiveRequestsMap = new Map();
  activeRequests.forEach(request => {
    dedupedActiveRequestsMap.set(`${request.method} ${request.url}`, request);
  });

  const activeRequestsInfo = Array.from(dedupedActiveRequestsMap.keys()).join(
    '\n'
  );

  return `XHR not found: '${method} ${url}'. Active requests are:\n${activeRequestsInfo}`;
}

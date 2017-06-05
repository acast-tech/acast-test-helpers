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

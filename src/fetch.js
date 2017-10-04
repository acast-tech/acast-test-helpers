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
import httpStatusCodes from './http-status-codes';

let originalFetch;
let pathToPromisesMap;

function createFakeFetch() {
  return sinon.spy(path => {
    let resolve;
    let reject;

    const promise = new Promise((promiseResolve, promiseReject) => {
      resolve = promiseResolve;
      reject = promiseReject;
    });

    const promises = pathToPromisesMap[path] || [];

    promises.push({ resolve, reject, promise });

    pathToPromisesMap[path] = promises;
    return promise;
  });
}

function pathIsAwaitingResolution(path) {
  return path in pathToPromisesMap && pathToPromisesMap[path].length;
}

function pathIsNotAwaitingResolution(path) {
  return !pathIsAwaitingResolution(path);
}

function getFormattedPathsAwaitingResolution() {
  let result = [];
  for (let key in pathToPromisesMap) {
    pathToPromisesMap[key].forEach(() => {
      result.push(`'${key}'`);
    });
  }
  return result.join(', ');
}

function notSetUp() {
  return !pathToPromisesMap;
}

function throwIfNotSetUp() {
  if (notSetUp()) {
    throw new Error(
      'acast-test-helpers#fetchRespond(): fetchRespond has to be called after setupFakeFetch() and before teardownFakeFetch()'
    );
  }
}

function throwIfPathIsNotAwaitingResolution(path) {
  if (pathIsNotAwaitingResolution(path)) {
    throw new Error(
      `acast-test-helpers#fetchRespond(): Could not find '${path}' among the fetched paths: [${getFormattedPathsAwaitingResolution()}]`
    );
  }
}

window.fetch = window.fetch; // For some unexplainable reason, PhantomJS doesn't pass the tests without this.

/**
 * Replaces the global `window.fetch` function with a fake one to intercept any calls to fetch, and enable the
 * tools in this module.
 * Should be called before each test method that wants to fake fetch.
 */
export function setupFakeFetch() {
  pathToPromisesMap = {};
  originalFetch = window.fetch;

  window.fetch = createFakeFetch();
}

/**
 * Restores the original `window.fetch` method and tears down what was set up with {@link setupFakeFetch}.
 * Should be called after each test method before which {@link setupFakeFetch} was called.
 */
export function teardownFakeFetch() {
  window.fetch = originalFetch;
  pathToPromisesMap = null;
}

/**
 * Resolve to a previously intercepted fetch call.
 * @param {string} path The path of the previous fetch call to respond to.
 * @returns {{resolveWith: (function(*=, *=)), rejectWith: (function(*=))}} An object with two methods:
 * `resolveWith` and `rejectWith`. Most often you want to use `resolveWith`, since even HTTP errors such as 404 will
 * result in a resolved fetch promise. `resolveWith` takes two arguments: the HTTP status, and the JSON return value.
 * @example
 * fetchRespond('/api/user/1337').resolveWith(200, {
 *   id: 1337,
 *   name: 'Fire'
 * });
 */
export function fetchRespond(path) {
  throwIfNotSetUp();
  throwIfPathIsNotAwaitingResolution(path);

  const { resolve, reject } = pathToPromisesMap[path].shift();

  return {
    resolveWith: (status, returnValue) => {
      if (typeof status !== 'number') {
        throw new Error(
          'First argument to `resolveWith` must be a number representing the response status.'
        );
      }

      resolve({
        status,
        statusText: httpStatusCodes[status],
        ok: status >= 200 && status <= 299,
        json() {
          return Promise.resolve(returnValue);
        },
      });
    },
    rejectWith: error => {
      reject(error);
    },
  };
}
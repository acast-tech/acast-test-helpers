let originalFetch;
let pathToPromisesMap;

function createFakeFetch() {
  return sinon.spy((path) => {
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

export function setupFakeFetch() {
  pathToPromisesMap = {};
  originalFetch = window.fetch;

  window.fetch = createFakeFetch();
}

export function teardownFakeFetch() {
  window.fetch = originalFetch;
  pathToPromisesMap = null;
}


export function fetchRespond(path) {
  throwIfNotSetUp();
  throwIfPathIsNotAwaitingResolution(path);

  const { resolve, reject, promise } = pathToPromisesMap[path].shift();

  return {
    resolveWith: (returnValue) => {
      resolve({
        json() {
          return returnValue;
        },
      });
      return promise.then().then();
    },
    rejectWith: (error) => {
      reject(error);
    },
  };
}

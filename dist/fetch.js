'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupFakeFetch = setupFakeFetch;
exports.teardownFakeFetch = teardownFakeFetch;
exports.fetchRespond = fetchRespond;
var originalFetch = void 0;
var pathToPromisesMap = void 0;

function createFakeFetch() {
  return sinon.spy(function (path) {
    var resolve = void 0;
    var reject = void 0;

    var promise = new Promise(function (promiseResolve, promiseReject) {
      resolve = promiseResolve;
      reject = promiseReject;
    });

    var promises = pathToPromisesMap[path] || [];

    promises.push({ resolve: resolve, reject: reject, promise: promise });

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
  var result = [];

  var _loop = function _loop(key) {
    pathToPromisesMap[key].forEach(function () {
      result.push('\'' + key + '\'');
    });
  };

  for (var key in pathToPromisesMap) {
    _loop(key);
  }
  return result.join(', ');
}

function notSetUp() {
  return !pathToPromisesMap;
}

function throwIfNotSetUp() {
  if (notSetUp()) {
    throw new Error('fetchRespond has to be called after setupFakeFetch() and before teardownFakeFetch()');
  }
}

function throwIfPathIsNotAwaitingResolution(path) {
  if (pathIsNotAwaitingResolution(path)) {
    throw new Error('Could not find \'' + path + '\' among the fetched paths: [' + getFormattedPathsAwaitingResolution() + ']');
  }
}

function setupFakeFetch() {
  pathToPromisesMap = {};
  originalFetch = window.fetch;

  window.fetch = createFakeFetch();
}

function teardownFakeFetch() {
  window.fetch = originalFetch;
  pathToPromisesMap = null;
}

function fetchRespond(path) {
  throwIfNotSetUp();
  throwIfPathIsNotAwaitingResolution(path);

  var _pathToPromisesMap$pa = pathToPromisesMap[path].shift();

  var resolve = _pathToPromisesMap$pa.resolve;
  var reject = _pathToPromisesMap$pa.reject;
  var promise = _pathToPromisesMap$pa.promise;


  return {
    resolveWith: function resolveWith(returnValue) {
      resolve({
        json: function json() {
          return returnValue;
        }
      });
      return promise.then().then();
    },
    rejectWith: function rejectWith(error) {
      reject(error);
    }
  };
}
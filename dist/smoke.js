'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupSmoke = setupSmoke;
exports.waitUntilFetchResolves = waitUntilFetchResolves;

var _async = require('./async');

var originalFetch = void 0;
var pathToOriginalReturnValue = void 0;

function setupSmokeFetch() {
  originalFetch = window.fetch;
  pathToOriginalReturnValue = {};
  window.fetch = function (path) {
    var originalReturnValue = originalFetch(path);
    pathToOriginalReturnValue[path] = originalReturnValue;
    return originalReturnValue;
  };
}

function teardownSmokeFetch() {
  window.fetch = originalFetch;
  pathToOriginalReturnValue = originalFetch = null;
}

function setupSmoke() {
  (0, _async.setupAsync)();

  beforeEach(setupSmokeFetch);
  afterEach(teardownSmokeFetch);
}

function waitUntilFetchResolves(path) {
  (0, _async.andThen)(function () {
    return pathToOriginalReturnValue[path];
  });
}
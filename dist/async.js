'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var testPromise = null;

function setupAsync() {
  beforeEach('create test promise', function () {
    testPromise = Promise.resolve();
  });

  afterEach('check test promise for errors', function () {
    var previousTestPromise = testPromise;
    testPromise = null;
    return previousTestPromise;
  });
}

function andThen(doThis) {
  if (!testPromise) {
    throw new Error('You cannot use andThen() unless you call setupAsync() at the root of the appropriate describe()!');
  }

  testPromise = testPromise.then(doThis);
}

function resolveWhenPredicateReturnsTruthy(predicate, resolve, pollInterval) {
  var returnValue = predicate();
  if (!!returnValue) {
    resolve(returnValue);
  } else {
    setTimeout(function () {
      resolveWhenPredicateReturnsTruthy(predicate, resolve, pollInterval);
    }, pollInterval);
  }
}

function waitUntil(thisReturnsTruthy) {
  var pollInterval = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];

  andThen(function () {
    return new Promise(function (resolve) {
      resolveWhenPredicateReturnsTruthy(thisReturnsTruthy, resolve, pollInterval);
    });
  });
}

exports.setupAsync = setupAsync;
exports.andThen = andThen;
exports.waitUntil = waitUntil;
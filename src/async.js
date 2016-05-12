let testPromise = null;

function setupAsync() {
  beforeEach('create test promise', () => {
    testPromise = Promise.resolve();
  });

  afterEach('check test promise for errors', () => {
    let previousTestPromise = testPromise;
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
  const returnValue = predicate();
  if (!!returnValue) {
    resolve(returnValue);
  } else {
    setTimeout(() => {
      resolveWhenPredicateReturnsTruthy(predicate, resolve, pollInterval);
    }, pollInterval);
  }
}

function waitUntil(thisReturnsTruthy, pollInterval = 100) {
  andThen(() => new Promise((resolve) => {
    resolveWhenPredicateReturnsTruthy(thisReturnsTruthy, resolve, pollInterval);
  }));
}

export { setupAsync, andThen, waitUntil };

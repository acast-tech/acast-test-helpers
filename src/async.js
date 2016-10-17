let testPromise = null;

const POLL_INTERVAL_MILLISECONDS = 100;

function setupAsync() {
  beforeEach('create test promise', () => {
    testPromise = Promise.resolve();
  });

  afterEach('check test promise for errors', function () {
    const testTimeout = this.timeout();
    this.timeout(0); // disable mocha timeout, since we're taking it over.

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error(testPromise.errorMessage));
      }, testTimeout);

      testPromise
        .then(returnValue => {
          cleanUp();
          resolve(returnValue);
        })
        .catch(error => {
          cleanUp();
          reject(error);
        });

      const cleanUp = () => {
        testPromise = null;
        clearTimeout(timeoutHandle);
        this.timeout(testTimeout);
      };
    });
  });
}

function andThen(doThis) {
  if (!testPromise) {
    throw new Error('acast-test-helpers#andThen(): You cannot use andThen() unless you call setupAsync() at the root of the appropriate describe()!');
  }

  testPromise = testPromise.then(doThis);
}

function resolveWhenPredicateReturnsTruthy(predicate, resolve) {
  const returnValue = predicate();
  if (!!returnValue) {
    resolve(returnValue);
  }
  else {
    setTimeout(() => {
      resolveWhenPredicateReturnsTruthy(predicate, resolve);
    }, POLL_INTERVAL_MILLISECONDS);
  }
}

function waitUntil(thisReturnsTruthy, errorMessage=`acast-test-helpers#waitUntil() timed out since the following function never returned a truthy value within the timeout: ${thisReturnsTruthy}`) {
  andThen(() => new Promise((resolve) => {
    testPromise.errorMessage = errorMessage;
    resolveWhenPredicateReturnsTruthy(thisReturnsTruthy, resolve);
  }));
}

function waitMillis(milliseconds) {
  andThen(() => new Promise(resolve => {
    testPromise.errorMessage = `acast-test-helpers#waitMillis() timed out while waiting ${milliseconds} milliseconds`;
    setTimeout(resolve, milliseconds);
  }));
}

export { setupAsync, andThen, waitUntil, waitMillis };

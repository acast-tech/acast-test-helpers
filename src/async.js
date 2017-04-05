let testPromise = null;

const POLL_INTERVAL_MILLISECONDS = 100;

function setupAsync() {
  beforeEach('create test promise', () => {
    if (testPromise) {
      return;
    }
    testPromise = Promise.resolve();
  });

  afterEach('check test promise for errors', function () {
    if (!testPromise) {
      return;
    }

    const testTimeout = this.currentTest.timeout();
    this.timeout(0); // disable mocha timeout, since we're taking it over.

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        const errorMessage = getErrorMessage();
        cleanUp();
        reject(new Error(errorMessage));
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
        clearTimeout(testPromise.timeoutHandle);
        testPromise = null;
        clearTimeout(timeoutHandle);
        this.timeout(testTimeout);
      };
    });
  });
}

function getErrorMessage() {
  if (typeof testPromise.errorMessage === 'function') {
    return testPromise.errorMessage();
  }
  return testPromise.errorMessage;
}

function andThen(doThis) {
  if (!testPromise) {
    throw new Error('acast-test-helpers#andThen(): You cannot use andThen() unless you call setupAsync() at the root of the appropriate describe()!');
  }

  testPromise = testPromise.then(doThis);
}

function resolveWhenPredicateReturnsTruthy(predicate, resolve, chainedValue) {
  let returnValue;
  try {
    returnValue = predicate(chainedValue);
  }
  catch (e) {
    testPromise.errorMessage = `acast-test-helpers#waitUntil() timed out. This is the last exception that was caught: ${e.message}`;
    returnValue = false;
  }
  if (!!returnValue) {
    resolve(returnValue);
  }
  else {
    testPromise.timeoutHandle = setTimeout(() => {
      resolveWhenPredicateReturnsTruthy(predicate, resolve, chainedValue);
    }, POLL_INTERVAL_MILLISECONDS);
  }
}

function waitUntil(thisReturnsTruthy, errorMessage = `acast-test-helpers#waitUntil() timed out since the following function never returned a truthy value within the timeout: ${thisReturnsTruthy}`) {
  andThen(chainedValue => new Promise((resolve) => {
    testPromise.errorMessage = errorMessage;
    resolveWhenPredicateReturnsTruthy(thisReturnsTruthy, resolve, chainedValue);
  }));
}

function waitMillis(milliseconds) {
  andThen(() => new Promise(resolve => {
    testPromise.errorMessage = `acast-test-helpers#waitMillis() timed out while waiting ${milliseconds} milliseconds`;
    setTimeout(resolve, milliseconds);
  }));
}

function waitUntilChange(predicate, errorMessage = `acast-test-helpers#waitUntilChange() timed out since the return value of the following function never changed: ${predicate}`) {
  let initialValue;
  let newValue;

  andThen(chainedValue => {
    initialValue = predicate(chainedValue);
    return chainedValue;
  });

  waitUntil(chainedValue => {
    newValue = predicate(chainedValue);
    return newValue !== initialValue;
  }, errorMessage);

  andThen(() => newValue);
}

export { setupAsync, andThen, waitUntil, waitMillis, waitUntilChange };

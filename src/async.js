let testPromise = null;

const POLL_INTERVAL_MILLISECONDS = 100;

/**
 * Sets up the async test tools by adding the appropriate calls to `beforeEach` and `afterEach`.
 * Call once in the top of a `describe` that you wish to use the async tools in.
 * NOTE: When using {@link setupAndTeardownApp}, it is not necessary to call this function separately.
 */
export function setupAsync() {
  beforeEach('create test promise', () => {
    if (testPromise) {
      return;
    }
    testPromise = Promise.resolve();
  });

  afterEach('check test promise for errors', function() {
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

/**
 * Triggers a callback after the previous asynchronous tool function resolves.
 * @param {function} doThis The callback function to call when the previous asynchronous tool function resolves. This
 * function will receive as argument the resolved result of that previous asynchronous tool function.
 * @example
 * waitUntilExists('.some-element');
 * andThen(someElementAsJqueryObject => {
 *   // someElementAsJqueryObject is the result of matching '.some-element'.
 * });
 *
 */
export function andThen(doThis) {
  if (!testPromise) {
    throw new Error(
      'acast-test-helpers#andThen(): You cannot use andThen() unless you call setupAsync() at the root of the appropriate describe()!'
    );
  }

  testPromise = testPromise.then(doThis);
}

function resolveWhenPredicateReturnsTruthy(predicate, resolve, chainedValue) {
  let returnValue;
  try {
    returnValue = predicate(chainedValue);
  } catch (e) {
    testPromise.errorMessage = `acast-test-helpers#waitUntil() timed out. This is the last exception that was caught: ${e.message}`;
    returnValue = false;
  }
  if (!!returnValue) {
    resolve(returnValue);
  } else {
    testPromise.timeoutHandle = setTimeout(() => {
      resolveWhenPredicateReturnsTruthy(predicate, resolve, chainedValue);
    }, POLL_INTERVAL_MILLISECONDS);
  }
}

/**
 * Waits until a callback returns any truthy value. It waits by polling the function repeatedly.
 * This is very useful for verifying test results, among other things.
 * @param {function} thisReturnsTruthy The function to poll.
 * @param {string|function} errorMessage The string, or function returning a string, to be shown if this times out.
 *
 * @example
 * waitUntil(() => expect(foobar).to.equal(3)); // This will either pass as the expectation holds and is returned as truthy, or keep polling.
 * @example
 * waitUntil(() => 3);
 * andThen(value => {
 *   // value = 3
 * });
 */
export function waitUntil(
  thisReturnsTruthy,
  errorMessage = `acast-test-helpers#waitUntil() timed out since the following function never returned a truthy value within the timeout: ${thisReturnsTruthy}`
) {
  andThen(
    chainedValue =>
      new Promise(resolve => {
        testPromise.errorMessage = errorMessage;
        resolveWhenPredicateReturnsTruthy(
          thisReturnsTruthy,
          resolve,
          chainedValue
        );
      })
  );
}

/**
 * Waits a specific number of milliseconds.
 * NOTE: Using this method is highly discouraged for anything other than temporary
 * experiments. The reason is that it leads to either very long running or non-deterministic tests,
 * none of which is desirable.
 * @param {number} milliseconds The number of milliseconds to wait.
 */
export function waitMillis(milliseconds) {
  andThen(
    () =>
      new Promise(resolve => {
        testPromise.errorMessage = `acast-test-helpers#waitMillis() timed out while waiting ${milliseconds} milliseconds`;
        setTimeout(resolve, milliseconds);
      })
  );
}

/**
 * Waits until a function gives a different return value from one call to the next.
 * @param {function} predicate The function to be polled.
 * @param {string|function} errorMessage The string, or function returning a string, to be shown if this times out.
 * @example
 * let foo = 'something';
 * waitUntilChange(() => foo);
 * andThen(theNewValueOfFoo => {
 *   console.log(theNewValueOfFoo); // 'something else'
 * });
 * setTimeout(() => {
 *   foo = 'something else';
 * }, 1000);
 */
export function waitUntilChange(
  predicate,
  errorMessage = `acast-test-helpers#waitUntilChange() timed out since the return value of the following function never changed: ${predicate}`
) {
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

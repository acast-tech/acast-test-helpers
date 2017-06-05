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
        statusText: statusToTextMap[status],
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

const statusToTextMap = {
  '100': 'Continue',
  '101': 'Switching Protocols',
  '102': 'Processing',
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '203': 'Non-Authoritative Information',
  '204': 'No Content',
  '205': 'Reset Content',
  '206': 'Partial Content',
  '207': 'Multi-Status',
  '208': 'Already Reported',
  '226': 'IM Used',
  '300': 'Multiple Choices',
  '301': 'Moved Permanently',
  '302': 'Found',
  '303': 'See Other',
  '304': 'Not Modified',
  '305': 'Use Proxy',
  '307': 'Temporary Redirect',
  '308': 'Permanent Redirect',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '402': 'Payment Required',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Not Acceptable',
  '407': 'Proxy Authentication Required',
  '408': 'Request Timeout',
  '409': 'Conflict',
  '410': 'Gone',
  '411': 'Length Required',
  '412': 'Precondition Failed',
  '413': 'Payload Too Large',
  '414': 'URI Too Long',
  '415': 'Unsupported Media Type',
  '416': 'Range Not Satisfiable',
  '417': 'Expectation Failed',
  '418': "I'm a teapot",
  '421': 'Misdirected Request',
  '422': 'Unprocessable Entity',
  '423': 'Locked',
  '424': 'Failed Dependency',
  '425': 'Unordered Collection',
  '426': 'Upgrade Required',
  '428': 'Precondition Required',
  '429': 'Too Many Requests',
  '431': 'Request Header Fields Too Large',
  '451': 'Unavailable For Legal Reasons',
  '500': 'Internal Server Error',
  '501': 'Not Implemented',
  '502': 'Bad Gateway',
  '503': 'Service Unavailable',
  '504': 'Gateway Timeout',
  '505': 'HTTP Version Not Supported',
  '506': 'Variant Also Negotiates',
  '507': 'Insufficient Storage',
  '508': 'Loop Detected',
  '509': 'Bandwidth Limit Exceeded',
  '510': 'Not Extended',
  '511': 'Network Authentication Required',
};

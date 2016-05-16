import { setupAsync, andThen } from './async';

let originalFetch;
let pathToOriginalReturnValue;


function setupSmokeFetch() {
  originalFetch = window.fetch;
  pathToOriginalReturnValue = {};
  window.fetch = (path) => {
    const originalReturnValue = originalFetch(path);
    pathToOriginalReturnValue[path] = originalReturnValue;
    return originalReturnValue;
  };
}

function teardownSmokeFetch() {
  window.fetch = originalFetch;
  pathToOriginalReturnValue = originalFetch = null;
}

export function setupSmoke() {
  setupAsync();

  beforeEach(setupSmokeFetch);
  afterEach(teardownSmokeFetch);
}

export function waitUntilFetchResolves(path) {
  andThen(() => pathToOriginalReturnValue[path]);
}
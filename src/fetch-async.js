import { setupAsync, waitUntil } from './async';
import { setupFakeFetch, teardownFakeFetch, fetchRespond } from '../src/fetch';

export function setupFakeFetchAsync() {
  setupAsync();

  beforeEach(setupFakeFetch);
  afterEach(teardownFakeFetch);
}

export function waitUntilFetchExists(path) {
  waitUntil(() => fetchRespond(path));
}
import { asyncIt, setupAsync } from '../../src';

describe('asyncIt', () => {
  setupAsync();

  asyncIt('consolidates returned promise with global test promise', () => {
    return Promise.resolve();
  });
});
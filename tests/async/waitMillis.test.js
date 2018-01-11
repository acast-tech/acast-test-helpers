import { asyncIt, setupAsync, waitMillis, andThen } from '../../src';

describe('waitMillis', () => {
  setupAsync();

  asyncIt('waits the specified amount of milliseconds', () => {
    const start = Date.now();

    waitMillis(1337);

    andThen(() => {
      const elapsed = Date.now() - start;
      const tolerance = 20;
      expect(elapsed).to.be.closeTo(1337, tolerance);
    });
  });
});
import { asyncIt, setupAsync, andThen } from '../../src';

describe('asyncIt', function () {
  this.timeout(500);
  setupAsync();

  asyncIt.skip('times out with regular timeout error if no custom error set when using done callback', function (done) {
    // This fails, manually check the error message.
  });

  asyncIt('can set a longer timeout', function (done) {
    this.timeout(1000);
    setTimeout(done, 750);
  });
});
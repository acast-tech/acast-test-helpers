import { asyncIt, setupAsync, andThen, waitUntil } from '../../src';

describe('andThen', () => {
  describe('without having called setupAsync()', () => {
    asyncIt('throws informative error', () => {
      expect(() => {
        andThen();
      }).to.throw('acast-test-helpers#andThen(): You cannot use the async functions unless you call setupAsync() at the root of the appropriate describe()!');
    });
  });

  describe('after having called setupAsync', () => {
    setupAsync();

    it('throws if not used inside `asyncIt`', () => {
      expect(() => {
        andThen();
      }).to.throw('acast-test-helpers#andThen(): You can only use the async functions from acast-test-helpers inside asyncIt.');
    });

    asyncIt.skip('fails with optional custom error message if promise returned in andThen never resolves', () => {
      andThen(() => new Promise(() => {}), () => 'This is a custom error message that should be shown when the test fails!');
      // This fails, manually check the error message.
    });

    asyncIt.skip('fails with default error message if promise returned in andThen never resolves', () => {
      andThen(() => new Promise(() => {}));
      // This fails, manually check the error message.
    });

    asyncIt.skip('does not override error message until execution', () => {
      waitUntil(() => false, 'This should be shown');
      andThen(() => new Promise(() => {}), 'This should not be shown when this test fails.');
      // This fails, manually check the error message.
    });

    asyncIt.skip('overrides error message upon execution', () => {
      waitUntil(() => true, 'This should not be shown.');
      andThen(() => new Promise(() => {}), 'This should be shown when the test fails.');
      // This fails, manually check the error message.
    });

    asyncIt('chains off of a global promise (behind the curtains)', () => {
      let sequence = '0';

      andThen(() => {
        sequence += '1';
      });

      expect(sequence).to.equal('0');

      andThen(() => {
        sequence += '2';
      });

      andThen(() => {
        expect(sequence).to.equal('012');
      });

      expect(sequence).to.equal('0');
    });

    asyncIt('cannot be nested', () => {
      let sequence = '0';
      andThen(() => {
        sequence += '1';
        expect(() => {
          andThen();
        }).to.throw('Also note that you cannot nest calls to async functions.');
      });

      andThen(() => {
        sequence += '2';
      });
    });
  });
});
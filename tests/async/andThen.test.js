import { asyncIt, setupAsync, andThen } from '../../src';

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
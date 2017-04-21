import { setupAsync, andThen } from '../../src';

describe('andThen', () => {
  describe('without having called setupAsync()', () => {
    it('throws informative error', () => {
      expect(() => {
        andThen();
      }).to.throw('You cannot use andThen() unless you call setupAsync() at the root of the appropriate describe()!');
    });
  });

  describe('after having called setupAsync', () => {
    setupAsync();

    it('NOTE: can be nested, but the ordering might be unintuitive', (done) => {
      let sequence = '0';
      andThen(() => {
        sequence += '1';
        andThen(() => {
          sequence += '3';
          expect(sequence).to.equal('0123');
          done();
        });
      });

      andThen(() => {
        sequence += '2';
      });
    });
  });
});
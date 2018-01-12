import { asyncIt as it, setupAsync, visit, andThen, setupAndTeardownApp } from '../../src';

describe('visit', () => {
  describe('when setupAndTeardownApp has not been called', () => {
    setupAsync();
    it('throws', () => {
      expect(() => {
        visit('/some/path');
      }).to.throw('acast-test-helpers#visit(): You cannot use visit() unless you pass a valid createHistory function to setupAndTeardownApp() at the root of the appropriate describe()!');
    });
  });

  describe('when setupAndTeardownApp has been called', () => {
    const pushSpy = sinon.spy();
    const createHistory = () => ({
      push: pushSpy
    });
    setupAndTeardownApp(_ => {}, createHistory);

    it('does not throw', () => {
      expect(() => {
        visit('/some/path');
      }).to.not.throw();
    });

    it('pushes path to history', () => {
      visit('/this/path');
      andThen(() => expect(pushSpy).to.have.been.calledWith('/this/path'));
    })
  });
});
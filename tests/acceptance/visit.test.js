import { asyncIt, setupAsync, visit, andThen, setupAndTeardownApp } from '../../src';

describe('visit', () => {
  describe('when setupAndTeardownApp has not been called', () => {
    setupAsync();
    asyncIt('throws', () => {
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

    asyncIt('does not throw', () => {
      expect(() => {
        visit('/some/path');
      }).to.not.throw();
    });

    asyncIt('pushes path to history', () => {
      visit('/this/path');
      andThen(() => expect(pushSpy).to.have.been.calledWith('/this/path'));
    })
  });
});
import { setupAsync, visit, andThen, setupAndTeardownApp } from '../../src';

describe('visit', () => {
  describe('when setupAndTeardownApp has not been called', () => {
    setupAsync();
    it('throws', () => {
      expect(() => {
        visit('/some/path');
      }).to.throw('You cannot use visit() unless you call setupAndTeardownApp() at the root of the appropriate describe()!')
    });
  });

  describe('when setupAndTeardownApp has been called', () => {
    const pushSpy = sinon.spy();
    const createHistory = () => ({
      push: pushSpy
    });
    const renderAppWithHistoryIntoElement = (history, element) => {};
    setupAndTeardownApp(createHistory, renderAppWithHistoryIntoElement);

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
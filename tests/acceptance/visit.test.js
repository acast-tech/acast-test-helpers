import { setupAsync, visit, setupAndTeardownApp } from '../../src';

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
    const createHistory = () => ({
      push: () => {
      }
    });
    const renderAppWithHistoryIntoElement = (history, element) => {};
    setupAndTeardownApp(createHistory, renderAppWithHistoryIntoElement);

    it('does not throw', () => {
      expect(() => {
        visit('/some/path');
      }).to.not.throw();
    });
  });
});
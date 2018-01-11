import { asyncIt, setupAsync, andThen, waitUntilExists } from '../../src';

describe('waitUntilExists', () => {
  setupAsync();

  const label = document.createElement('label');
  label.innerHTML = 'foobar';

  afterEach(() => {
    document.body.removeChild(label);
  });

  asyncIt('resolves with a jquery object of the selector when it exists', () => {
    setTimeout(() => {
      label.innerHTML = 'foobar';
      document.body.appendChild(label);
    }, 1000);

    waitUntilExists('label:contains("foobar")');

    andThen((label) => {
      expect(label.text()).to.equal('foobar');
    });
  });
});

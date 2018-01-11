import { asyncIt, andThen, setupFakeFetchAsync, waitUntilFetchExists } from '../../src';

describe('fake fetch async', () => {
  setupFakeFetchAsync();

  asyncIt('resolves with the promise-looking object', () => {
    waitUntilFetchExists('/some/path');

    andThen(fetchRequest => {
      fetchRequest.resolveWith(200, {someKey: 'someValue'});
    });

    return fetch('/some/path').then(response => response.json().then(json => {
      expect(json).to.deep.equal({someKey: 'someValue'});
    }));
  });
});
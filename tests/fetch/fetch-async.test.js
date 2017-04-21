import { setupAsync, andThen } from '../../src/async';
import { setupFakeFetchAsync, waitUntilFetchExists } from '../../src/fetch-async';

describe('fake fetch async', () => {
  setupAsync();
  setupFakeFetchAsync();

  it('resolves with the promise-looking object', () => {
    waitUntilFetchExists('/some/path');

    andThen(fetchRequest => {
      fetchRequest.resolveWith({someKey: 'someValue'});
    });

    return fetch('/some/path').then(response => {
      expect(response.json()).to.deep.equal({someKey: 'someValue'});
    });
  });
});
import { asyncIt as it, setupAsync, waitUntil, waitUntilChange, andThen } from '../../src';

describe('waitUntilChange', () => {
  setupAsync();
  it('moves on when the predicate returns a different value than the first call', () => {
    let value = 4;

    setTimeout(() => {
      value = 0;
    }, 10);

    waitUntilChange(() => value);

    andThen(resolvedValue => expect(resolvedValue).to.equal(0));
  });

  it('passes the chained value to predicate', () => {
    const obj = { value: 4 };

    setTimeout(() => {
      obj.value = 0;
    }, 10);

    waitUntil(() => obj);

    waitUntilChange(chained => chained.value);

    andThen(resolvedValue => expect(resolvedValue).to.equal(0));
  });
});
import { asyncIt as it, setupAsync, waitUntil, andThen } from '../../src';

describe('waitUntil', () => {
  setupAsync();
  it('resolves when predicate returns true', () => {
    let value = false;

    setTimeout(() => {
      value = true;
    }, 200);

    waitUntil(() => value);

    andThen(() => {
      expect(value).to.be.true();
    });
  });

  it.skip('shuts down predicate after timeout', () => {
    waitUntil(() => {
      console.log('this should stop logging after test times out');
    });
    // This fails, manually check the error message.
  });

  it.skip('handles expections, returning the message of the last one upon timeout', () => {
    waitUntil(() => expect('foo').to.equal('bar'));
    // This fails, manually check the error message.
  });

  it.skip('handles expections, returning the lazily evaluated message from the optional function passed', () => {
    waitUntil(() => false, () => 13 + 37);
    // This fails, manually check the error message.
  });

  it('handles exceptions, silently treating them as falsy return values', () => {
    let value = false;

    setTimeout(() => {
      value = true;
    }, 200);

    waitUntil(() => {
      expect(value).to.be.true();
      return value;
    });

    andThen(chainedValue => {
      expect(chainedValue).to.be.true();
    });
  });

  it('can be used solely to wait for an expectation to be true', () => {
    let fruit = 'apple';

    setTimeout(() => {
      fruit = 'banana';
    }, 200);

    waitUntil(() => expect(fruit).to.equal('banana'));
  });

  it('resolves when predicate returns truthy string', () => {
    let value = false;

    setTimeout(() => {
      value = 'some string';
    }, 200);

    waitUntil(() => value);
  });

  it('resolves with the truthy value', () => {
    waitUntil(() => 'the value, yo');

    andThen((parameter) => {
      expect(parameter).to.equal('the value, yo');
    });
  });

  it('passes along the previously resolved value to the predicate', () => {
    andThen(() => {
      return 'the resolved value';
    });
    waitUntil(theResolvedValue => {
      return theResolvedValue;
    });
    andThen(theResolvedValue => {
      expect(theResolvedValue).to.equal('the resolved value');
    })
  });

  it('passes along the previously resolved value to each iteration of the predicate', () => {
    const obj = { value: false };

    setTimeout(() => {
      obj.value = true;
    }, 200);

    andThen(() => {
      return obj;
    });

    waitUntil(theResolvedObject => expect(theResolvedObject.value).to.be.true());
  });

  it('polls at every hundred milliseconds', (done) => {
    let value = false;
    let didComplete = false;

    setTimeout(() => {
      value = true;
    }, 50);

    setTimeout(() => {
      value = false;
    }, 80);

    waitUntil(() => value);

    andThen(() => {
      didComplete = true;
    });

    setTimeout(() => {
      expect(didComplete).to.be.false();
      value = true;
      done();
    }, 1500);
  });

  it('makes first poll immediately', () => {
    let value = true;

    setTimeout(() => {
      value = false;
    }, 1);

    waitUntil(() => value);

    andThen(() => {
      expect(value).to.be.true();
    });
  });
});
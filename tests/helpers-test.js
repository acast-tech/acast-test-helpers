import $ from 'jquery';
import { setupAsync, andThen, waitUntil, waitMillis, waitUntilChange } from '../src/async';
import {
  waitUntilExists,
  waitUntilDisappears,
  visit,
  setupAndTeardownApp,
  click,
  mouseDown,
  mouseUp,
  mouseMove,
  scaleWindowWidth
} from '../src/acceptance';
import { setupFakeFetch, teardownFakeFetch, fetchRespond } from '../src/fetch';
import { setupFakeFetchAsync, waitUntilFetchExists } from '../src/fetch-async';
import { startFakingXhr, stopFakingXhr, findXhr, waitUntilXhrExists } from '../src/xhr';

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

describe('waitMillis', () => {
  setupAsync();

  it('waits the specified amount of milliseconds', () => {
    const start = Date.now();

    waitMillis(1337);

    andThen(() => {
      const elapsed = Date.now() - start;
      const tolerance = 20;
      expect(elapsed).to.be.closeTo(1337, tolerance);
    });
  });
});

describe('waitUntilExists', () => {
  setupAsync();

  const label = document.createElement('label');
  label.innerHTML = 'foobar';

  afterEach(() => {
    document.body.removeChild(label);
  });

  it('resolves with a jquery object of the selector when it exists', () => {
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

describe('waitUntilDisappears', () => {
  setupAsync();

  const label = document.createElement('label');
  label.innerHTML = 'foobar';

  it('resolve when the object disappears after having showed', (done) => {
    let callback = sinon.spy();

    waitUntilDisappears('label:contains("foobar")');

    andThen(callback);

    setTimeout(() => {
      expect(callback).to.not.have.been.called('Called before selector appeared!');
    }, 150);

    setTimeout(() => {
      document.body.appendChild(label);
    }, 250);

    setTimeout(() => {
      expect(callback).to.not.have.been.called('Called before selector disappeared!');
    }, 350);

    setTimeout(() => {
      document.body.removeChild(label);
    }, 450);

    setTimeout(() => {
      expect(callback).to.have.been.calledOnce('Not called when selector disappeared!');
      done();
    }, 550);
  });
});

describe('fake fetch', () => {
  mocha.setup({ globals: ['fetch'] });

  describe('tear down', () => {
    it('restores whatever fetch was before setup', () => {
      window.fetch = 'foobar';
      setupFakeFetch();
      teardownFakeFetch();
      expect(fetch).to.equal('foobar');
    });

    it('forgets stored fetch calls', () => {
      setupFakeFetch();
      fetch('foobar');
      teardownFakeFetch();
      expect(() => {
        fetchRespond('foobar');
      }).to.throw();
    });
  });

  describe('set up', () => {
    afterEach(() => {
      teardownFakeFetch();
    });

    it('replaces window.fetch with callable function', () => {
      window.fetch = 'something not callable';
      setupFakeFetch();
      fetch('/api/whatever');
    });
  });

  describe('usage', () => {
    beforeEach(setupFakeFetch);
    afterEach(teardownFakeFetch);

    it('can expect fetch not to have been called', () => {
      expect(fetch).not.to.have.been.called();
    });

    it('can expect fetch to have been called', () => {
      fetch('/api/foobar');
      expect(fetch).to.have.been.called();
    });

    it('can expect path to have been fetched', () => {
      const path = '/api/foobar';
      fetch(path);
      expect(fetch).to.have.been.calledWith(path);
    });

    it('can expect path not to have been fetched', () => {
      fetch('/api/foobar');
      expect(fetch).not.to.have.been.calledWith('/other/path');
    });

    it('fetch returns promise', () => {
      const result = fetch('foobar');
      expect(result).to.be.an.instanceOf(Promise);
    });

    describe('fetchRespond', () => {
      it('can reply to fetch with json', (done) => {
        const callback = sinon.spy();
        fetch('/api/foobar')
          .then(response => response.json())
          .then(callback).then(() => {
          expect(callback).to.have.been.calledOnce().and.to.have.been.calledWith({ foo: 'bar' });
        })
          .then(done);

        fetchRespond('/api/foobar').resolveWith({ foo: 'bar' });
      });

      it('returns a promise that can be used for testing chains', (done) => {
        const callback = sinon.spy();
        fetch('path').then(response => response.json()).then(callback);

        fetchRespond('path').resolveWith({ key: 'value' }).then(() => {
          expect(callback).to.have.been.calledWith({ key: 'value' });
        }).then(done).catch(done);
      });

      it('returns a promise that can be used for testing longer chains', (done) => {
        const callback = sinon.spy();
        fetch('path').then(response => response.json()).then(json => json.key).then(callback);

        fetchRespond('path').resolveWith({ key: 'value' }).then(() => {
          expect(callback).to.have.been.calledWith('value');
        }).then(done).catch(done);
      });

      it('leaves other promises untouched when resolving fetch with json', (done) => {
        const callback = sinon.spy();

        fetch('/otherPath').then(callback).catch(callback);

        fetch('/api/foobar').then(() => {
          expect(callback).not.to.have.been.called();
          done();
        });

        fetchRespond('/api/foobar').resolveWith({ foo: 'bar' });
      });

      it('can resolve other promise than the last one', (done) => {
        const firstCallback = sinon.spy();
        const secondCallback = sinon.spy();

        fetch('/firstPath').then(firstCallback).then(done);

        fetch('/second/path').then(secondCallback).then(() => done('Error: this should not be called'));

        fetchRespond('/firstPath').resolveWith({ foo: 'bar' });
      });

      it('can reply to fetch with other json', (done) => {
        const callback = sinon.spy();
        fetch('/somepath')
          .then(response => response.json())
          .then(callback).then(() => {
          expect(callback).to.have.been.calledOnce();
          expect(callback).to.have.been.calledWith('some response');
        })
          .then(done);

        fetchRespond('/somepath').resolveWith('some response');
      });

      it('can reject fetch with error', (done) => {
        const callback = sinon.spy();
        fetch('/somepath')
          .catch(callback)
          .then(() => {
            expect(callback).to.have.been.calledOnce().and.to.have.been.calledWith('some error');
          })
          .then(done);

        fetchRespond('/somepath').rejectWith('some error');
      });

      it('throws if called with uncalled path', () => {
        expect(() => {
          fetchRespond('/path/that/was/never/called');
        }).to.throw("Could not find '/path/that/was/never/called' among the fetched paths: []");

        expect(() => {
          fetchRespond('other path');
        }).to.throw("Could not find 'other path' among the fetched paths: []");
      });

      it('throws if called with path that has already been responded to as many times as it was fetched', () => {
        fetch('path');
        fetchRespond('path');
        expect(() => {
          fetchRespond('path');
        }).to.throw("Could not find 'path' among the fetched paths: []");
      });

      it('throws if called after teardown', () => {
        teardownFakeFetch();
        expect(() => {
          fetchRespond('/path/that/was/never/called');
        }).to.throw(
          'fetchRespond has to be called after setupFakeFetch() and before teardownFakeFetch()'
        );
      });

      it('lists called paths in error when called with unmatched path', () => {
        fetch('/somepath');
        fetch('otherpath');
        fetch('/third/path');

        expect(() => {
          fetchRespond('/path/that/was/never/called');
        }).to.throw("Could not find '/path/that/was/never/called' among " +
          "the fetched paths: ['/somepath', 'otherpath', '/third/path']");
      });

      it('lists same path multiple times in error when called with unmatched path', () => {
        fetch('/same');
        fetch('/same');
        fetch('/same');

        expect(() => {
          fetchRespond('/other');
        }).to.throw("Could not find '/other' among " +
          "the fetched paths: ['/same', '/same', '/same']");
      });

      it('resolves multiple calls to same path in the order they were called', (done) => {
        const firstCallback = sinon.spy();
        const secondCallback = sinon.spy();

        fetch('/same/path').then(response => firstCallback(response.json()));
        fetch('/same/path').then(response => secondCallback(response.json()));

        Promise.all([
          fetchRespond('/same/path').resolveWith({ order: 'first' }),
          fetchRespond('/same/path').resolveWith({ order: 'second' })]
        ).then(() => {
          expect(firstCallback).to.have.been.calledOnce().and.to.have.been.calledWith({ order: 'first' });
          expect(secondCallback).to.have.been.calledOnce().and.to.have.been.calledWith({ order: 'second' });

          expect(secondCallback).to.have.been.calledAfter(firstCallback);
        }).then(done).catch(done);
      });
    });
  });
});

describe('fake fetch async', () => {
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
    const renderAppWithHistoryIntoElement = (history, element) => {
    };
    setupAndTeardownApp(createHistory, renderAppWithHistoryIntoElement);

    it('does not throw', () => {
      expect(() => {
        visit('/some/path');
      }).to.not.throw();
    });
  });
});

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

describe('Mouse Events', () => {
  describeMouseEventHelper(click, 'click', (attachElementToBody) => {
    it('triggers mousedown and mouseup before click', () => {
      const $element = $(attachElementToBody());
      const mouseDownListener = sinon.spy();
      const mouseUpListener = sinon.spy();
      const clickListener = sinon.spy();

      $element.on('mousedown', mouseDownListener);
      $element.on('mouseup', mouseUpListener);
      $element.on('click', clickListener);

      click($element);

      andThen(() => {
        sinon.assert.callOrder(mouseDownListener, mouseUpListener, clickListener);
      });
    });
  });
  describeMouseEventHelper(mouseDown, 'mousedown');
  describeMouseEventHelper(mouseUp, 'mouseup');
  describeMouseEventHelper(mouseMove, 'mousemove');

  function describeMouseEventHelper(func, eventName, extraTests = ()=> {
  }) {
    describe(func.name, () => {
      setupAsync();

      let elementToInteractWith;

      function attachElementToBody() {
        document.body.appendChild(elementToInteractWith);
        return elementToInteractWith;
      }

      beforeEach(() => {
        elementToInteractWith = document.createElement('div');
        elementToInteractWith.className = 'element-to-interact-with';
      });

      afterEach(() => {
        document.body.removeChild(elementToInteractWith);
      });

      it(`triggers ${eventName} event on selected element`, () => {
        attachElementToBody();
        const spy = sinon.spy();
        $(elementToInteractWith).on(eventName, spy);
        func('.element-to-interact-with');
        andThen(() => {
          expect(spy).to.have.been.calledOnce();
        });
      });

      it('waits until element shows up before trying to interact with it', () => {
        const spy = sinon.spy();
        $(elementToInteractWith).on(eventName, spy);
        func('.element-to-interact-with');
        andThen(() => {
          expect(spy).to.have.been.calledOnce();
        });

        setTimeout(attachElementToBody, 500);
      });

      it('takes extra options as parameters', (done) => {
        const element = attachElementToBody();
        $(element).on(eventName, e => {
          expect(e.clientX).to.equal(1337);
          expect(e.clientY).to.equal(1338);
          done();
        });
        func('.element-to-interact-with', { clientX: 1337, clientY: 1338 });
      });

      it('evaluates options lazily if passed as function', (done) => {
        let screenX = 42;

        andThen(() => {
          screenX = 1337;
        });

        func('.element-to-interact-with', () => ({ screenX }));

        const element = attachElementToBody();
        $(element).on(eventName, e => {
          expect(e.screenX).to.equal(1337);
          done();
        });
      });

      extraTests(attachElementToBody);
    });
  }
});

describe('fake xhr', () => {
  describe('findXhrRequest', () => {

    it('throws immediately if xhr faking is not started', () => {
      expect(() => {
        findXhr('POST', 'whatever/endpoint');
      }).to.throw('findXhr can only be used between calls to startFakingXhr and stopFakingXhr!')
    });

    it('throws immediately if xhr faking is stopped', () => {
      startFakingXhr();
      stopFakingXhr();

      expect(() => {
        findXhr('POST', 'whatever/endpoint');
      }).to.throw('findXhr can only be used between calls to startFakingXhr and stopFakingXhr!')
    });

    it('returns null if no such request could be found', () => {
      startFakingXhr();
      expect(findXhr('POST', 'whatever/endpoint')).to.be.null();
      stopFakingXhr();
    });

    it('returns a request that matches', () => {
      startFakingXhr();
      const sentRequest = sendRequest('POST', 'some/endpoint');
      expect(findXhr('POST', 'some/endpoint')).to.equal(sentRequest);
      stopFakingXhr();
    });

    it('does not match request that is already responded to', () => {
      startFakingXhr();
      const sentRequest = sendRequest('POST', 'some/endpoint');
      sentRequest.respondWithJson(200, {});
      expect(sentRequest.readyState).to.equal(4);
      expect(findXhr('POST', 'some/endpoint')).to.be.null();
      stopFakingXhr();
    });
  });

  describe('waitUntilXhrExists', () => {
    setupAsync();

    it('resolves when the request is found', () => {
      startFakingXhr();
      waitUntilXhrExists('POST', '/some/endpoint/path');
      andThen(request => {
        expect(request).to.exist();
        expect(request).to.equal(findXhr('POST', '/some/endpoint/path'));
      });

      setTimeout(() => {
        sendRequest('POST', '/some/endpoint/path');
      }, 1000);
    });
  });
});

describe('test div dimensions', () => {
  const createHistory = () => ({
    push: () => {
    }
  });
  const renderAppWithHistoryIntoElement = (history, element) => {
  };
  setupAndTeardownApp(createHistory, renderAppWithHistoryIntoElement);

  it('starts at 1024 x 1024', () => {
    assertTestRootWidthAndHeight(1024, 1024);
  });

  it('width can be scaled down with scaleWindowWidth', () => {
    scaleWindowWidth(0.5);

    assertTestRootWidthAndHeight(512, 1024);
  });

  it('width can be scaled up with scaleWindowWidth', () => {
    scaleWindowWidth(2);

    assertTestRootWidthAndHeight(2048, 1024);
  });

  it('width can be scaled multiple times with scaleWindowWidth', () => {
    scaleWindowWidth(0.5);
    scaleWindowWidth(2);

    assertTestRootWidthAndHeight(1024, 1024);
  });

  it('triggers window resize event when calling scaleWindowWidth', () => {
    var eventListener = sinon.spy();
    $(window).resize(eventListener);

    scaleWindowWidth(2);

    andThen(() => {
      expect(eventListener).to.have.been.calledOnce();
    })
  });

  function assertTestRootWidthAndHeight(expectedWidth, expectedHeight) {
    andThen(() => {
      var testRoot = $('#test-root');
      expect(testRoot.width()).to.equal(expectedWidth);
      expect(testRoot.height()).to.equal(expectedHeight);
    });
  }
});


function sendRequest(method, url) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.send();
  return request;
}
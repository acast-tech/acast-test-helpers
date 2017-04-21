import { setupFakeFetch, teardownFakeFetch, fetchRespond } from '../../src/fetch';

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
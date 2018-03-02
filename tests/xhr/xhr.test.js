import { asyncIt as it, setupAsync, andThen, startFakingXhr, stopFakingXhr, findXhr, waitUntilXhrExists } from '../../src';

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

  describe('request object', () => {
    beforeEach(startFakingXhr);
    afterEach(stopFakingXhr);

    describe('respond', () => {
      it('can be used to respond manually with status code and headers', () => {
        const request = sendRequest('GET', '/some/endpoint');
        request.respond(200, {'Some-Header': 'some-header-value'}, JSON.stringify({someBodyKey: 'someBodyValue'}));

        expect(request.readyState).to.equal(4);
        expect(request.status).to.equal(200);
        expect(request.responseHeaders).to.deep.equal({'Some-Header': 'some-header-value'});
        expect(JSON.parse(request.responseText)).to.deep.equal({someBodyKey: 'someBodyValue'});
      });
    });

    describe('respondWithJson', () => {
      it('can be used as convenience method to send JSON without having to stringify body and set JSON header', () => {
        const request = sendRequest('GET', '/some/endpoint');
        request.respondWithJson(200, {someBodyKey: 'someBodyValue'});

        expect(request.readyState).to.equal(4);
        expect(request.status).to.equal(200);
        expect(request.responseHeaders).to.deep.equal({'Content-Type': 'application/json'});
        expect(JSON.parse(request.responseText)).to.deep.equal({someBodyKey: 'someBodyValue'});
      });

      it('sets status to 200 by default', () => {
        const request = sendRequest('GET', '/some/endpoint');
        request.respondWithJson({someBodyKey: 'someBodyValue'});

        expect(request.readyState).to.equal(4);
        expect(request.status).to.equal(200);
        expect(request.responseHeaders).to.deep.equal({'Content-Type': 'application/json'});
        expect(JSON.parse(request.responseText)).to.deep.equal({someBodyKey: 'someBodyValue'});
      });

      it('can be used to simply send status', () => {
        const request = sendRequest('GET', '/some/endpoint');
        request.respondWithJson(404);

        expect(request.readyState).to.equal(4);
        expect(request.status).to.equal(404);
        expect(request.responseHeaders).to.deep.equal({'Content-Type': 'application/json'});
        expect(JSON.parse(request.responseText)).to.deep.equal({});
      });
    });
  });
});


function sendRequest(method, url) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.send();
  return request;
}
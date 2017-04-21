import { setupAsync, andThen, startFakingXhr, stopFakingXhr, findXhr, waitUntilXhrExists } from '../../src';

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


function sendRequest(method, url) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.send();
  return request;
}
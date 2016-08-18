import FakeXMLHttpRequest from 'fake-xml-http-request';

// Extends FakeXMLHttpRequest to register each new
// request with fakehr
function FakeRequest() {
  FakeXMLHttpRequest.call(this);
  fakehr.addRequest(this);

  this.respondWithJson = (statusCode, payload) => (
    this.respond(statusCode, { 'Content-Type': 'application/json' }, JSON.stringify(payload))
  );

}
FakeRequest.prototype = FakeXMLHttpRequest.prototype;

// reference the native XMLHttpRequest object so
// it can be restored later
var nativeRequest = window.XMLHttpRequest;

var fakehr = {
  addRequest: function (r) {
    this.requests.push(r);
  },
  start: function () {
    this.requests = this.requests || [];
    window.XMLHttpRequest = FakeRequest;
  },
  stop: function () {
    window.XMLHttpRequest = nativeRequest;
  },
  clear: function () {
    var requests = this.requests;
    // removes the objects from the original array
    // just in case someone is referencing it.
    // the removed requests will never get a response.
    while (requests.length > 0) {
      requests.pop();
    }
  },
  reset: function () {
    this.stop();
    this.clear();
  },

  /**
   * Matches the given request with mocked.
   * @param method
   * @param url
   * @param requestBody The request body for advanced comparison (useful for POST requests with the same url).
   * @param readyState
   * @returns {Object} the matched request if found or undefined.
   */
  match: function (method, url, requestBody, readyState) {
    if (readyState === undefined) {
      readyState = 1;
    }

    var requests = this.requests;
    for (var i = requests.length - 1; i >= 0; i--) {
      var request = requests[i];
      if (request.method.toLowerCase() === method.toLowerCase() && request.url === url && request.readyState === readyState &&
        (!requestBody || request.requestBody === requestBody)) {
        return request;
      }
    }
    ;
  }
}

export default fakehr;
/*
 This file is a modified copy of https://github.com/trek/fakehr/blob/master/fakehr.js.

 Copyright (c) 2014 Trek Glowacki and contributors

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

import FakeXMLHttpRequest from 'fake-xml-http-request';

/**
 * Extends {@link https://github.com/pretenderjs/FakeXMLHttpRequest|FakeXMLHttpRequest} to register each new request with fakehr
 *
 * Also has the convenience method `respondWithJson` that takes two arguments:
 * the HTTP status code as an int, and the response body as a plain object (that will be stringified by the function)
 * @class FakeRequest
 */
function FakeRequest() {
  FakeXMLHttpRequest.call(this);
  fakehr.addRequest(this);

  this.respondWithJson = (statusCode, payload) =>
    this.respond(
      statusCode,
      { 'Content-Type': 'application/json' },
      JSON.stringify(payload)
    );
}
FakeRequest.prototype = FakeXMLHttpRequest.prototype;

// reference the native XMLHttpRequest object so
// it can be restored later
var nativeRequest = window.XMLHttpRequest;

var fakehr = {
  addRequest: function(r) {
    this.requests.push(r);
  },
  start: function() {
    this.requests = this.requests || [];
    window.XMLHttpRequest = FakeRequest;
  },
  stop: function() {
    window.XMLHttpRequest = nativeRequest;
  },
  clear: function() {
    var requests = this.requests;
    // removes the objects from the original array
    // just in case someone is referencing it.
    // the removed requests will never get a response.
    while (requests.length > 0) {
      requests.pop();
    }
  },
  reset: function() {
    this.stop();
    this.clear();
  },

  /*
   * Matches the given request with mocked.
   * @param method
   * @param url
   * @param requestBody The request body for advanced comparison (useful for POST requests with the same url).
   * @param readyState
   * @returns {FakeRequest} the matched request if found or undefined.
   */
  match: function(method, url, requestBody, readyState) {
    if (readyState === undefined) {
      readyState = 1;
    }

    var requests = this.requests;
    for (var i = requests.length - 1; i >= 0; i--) {
      var request = requests[i];
      if (
        request.method.toLowerCase() === method.toLowerCase() &&
        request.url === url &&
        request.readyState === readyState &&
        (!requestBody || request.requestBody === requestBody)
      ) {
        return request;
      }
    }
    return null;
  },
};

export default fakehr;

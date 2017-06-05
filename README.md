# acast-test-helpers
## Capabilites
* Browser level acceptance testing (`visit`, `click`, `waitUntilExists`)
* Asynchronous unit testing (`andThen`, `waitUntil`, `waitUntilChange`)
* Faking XHR (`waitUntilXhrExists`, `findXhr`, `resolveWithJson`)
* Faking Fetch API (`waitUntilFetchExists`, `fetchRespond`)

## Overview
This library contains a bunch of helper methods that greatly simplify asynchronous unit and acceptance 
testing of front end web apps with Mocha. It also includes two different 
ways to stub server calls: one for when using window.fetch, and another for using regular XHR.

The core of this library is a set of Ember-inspired asynchronous acceptance testing tools 
like `visit`, `click`, `waitUntilExists` and `andThen` among others.
 
A noteworthy aspect is that while Ember and others have changed 
their networking testing tools (for testing XHR and/or Fetch) to 
require the setting up the network responses prior to the actual 
network calls, this library simply catches all network requests and 
lets you deal with them after the fact.
 
So instead of this (in pseudo-code):
```js
set up mock response for endpoint
run code that will call the endpoint 
verify results
```
you would do this: 
```js
run code that will call the endpoint
trigger mock response to endpoint call 
verify results
```
See Examples below for actual code. 

We have found this order of things reads much more naturally. 
It also greatly simplify testing of pending states and enable a 
smoother way to verify that the correct network requests are being made 
in the first place.
   
## Compatibility

For testing with Mocha. Currently only runs in browsers, see 
[issue #1](https://github.com/acastSthlm/acast-test-helpers/issues/1). 

## Example
```js
import {
  setupAndTeardownApp,
  startFakingXhr,
  stopFakingXhr,
  visit,
  click,
  waitUntilExists,
  andThen,
  waitUntilXhrExists,
  setupFakeFetchAsync,
  waitUntilFetchExists,
} from 'acast-test-helpers';
import { createMemoryHistory } from 'react-router';
import renderMyApp from 'renderMyApp.js';

describe('my app', () => {
  setupAndTeardownApp(createMemoryHistory, renderMyApp);

  describe('with basic acceptance testing', () => {
    it('shows greeting when I click the hello button on the say-hello page', () => {
      visit('/say-hello');

      click('.hello-button'); // This will wait for the button to show up, and then click it. Any jQuery selector will work.

      waitUntilExists('.greeting'); // After the click has been performed, this will start looking for the greeting.

      andThen(greeting => { // When the greeting appears, it will be passed as the single argument to the function passed to the following `andThen` call.
        expect(greeting.text()).to.equal('Hello World!'); // `greeting` is a jQuery object.
      });
    });
  });


  describe('with fake XHR', () => {
    beforeEach(startFakingXhr);
    afterEach(stopFakingXhr);

    it('displays the number of eggs we currently have on the server (using regular XHR)', () => {
      visit('/eggs');

      waitUntilXhrExists('GET', '/api/v1/eggs');

      andThen(request => {
        request.respondWithJson(200, {
          eggCount: 42,
        });
      });

      waitUntilExists('.egg-counter:contains("42")');
    });
  });


  describe('with fake fetch', () => {
    setupFakeFetchAsync();

    it('shows the color of the day (using Fetch API)', () => {
      visit('/color');

      waitUntilFetchExists('/api/v1/color');

      andThen(fetchRequest => {
        fetchRequest.resolveWith(200, {
          color: '#65a1e7'
        });
      });

      waitUntil(() => expect(find('.color-of-the-day').css('background-color')).to.equal('#65a1e7'));
    });
  });
});
```

## Installation
Make sure to add our GemFury repo to you npm path with something like 
this: https://github.com/acastSthlm/test-setup-and-examples/blob/master/.npmrc

Then simply:
`npm install --save-dev --save-exact acast-test-helpers`
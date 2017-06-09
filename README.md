# acast-test-helpers

<!-- toc -->

- [Capabilites](#capabilites)
- [Overview](#overview)
- [Compatibility](#compatibility)
- [Example](#example)
- [Installation](#installation)
- [API](#api)
  * [setupAndTeardownApp](#setupandteardownapp)
  * [scaleWindowWidth](#scalewindowwidth)
  * [visit](#visit)
  * [click](#click)
  * [mouseDown](#mousedown)
  * [mouseUp](#mouseup)
  * [mouseMove](#mousemove)
  * [fillIn](#fillin)
  * [keyEventIn](#keyeventin)
  * [waitUntilExists](#waituntilexists)
  * [waitUntilDisappears](#waituntildisappears)
  * [waitUntilDoesNotExist](#waituntildoesnotexist)
  * [find](#find)
  * [jQuery](#jquery)
  * [setupAsync](#setupasync)
  * [andThen](#andthen)
  * [waitUntil](#waituntil)
  * [waitMillis](#waitmillis)
  * [waitUntilChange](#waituntilchange)
  * [setupFakeFetchAsync](#setupfakefetchasync)
  * [waitUntilFetchExists](#waituntilfetchexists)
  * [setupFakeFetch](#setupfakefetch)
  * [teardownFakeFetch](#teardownfakefetch)
  * [fetchRespond](#fetchrespond)
  * [startFakingXhr](#startfakingxhr)
  * [stopFakingXhr](#stopfakingxhr)
  * [findXhr](#findxhr)
  * [waitUntilXhrExists](#waituntilxhrexists)
  * [FakeRequest](#fakerequest)

<!-- tocstop -->

## Capabilites

-   Browser level acceptance testing (`visit`, `click`, `waitUntilExists`)
-   Asynchronous unit testing (`andThen`, `waitUntil`, `waitUntilChange`)
-   Faking XHR (`waitUntilXhrExists`, `findXhr`, `resolveWithJson`)
-   Faking Fetch API (`waitUntilFetchExists`, `fetchRespond`)

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
  setupAndTeardownApp(renderMyApp, createMemoryHistory);

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

`npm install --save-dev --save-exact acast-test-helpers`
or the shorter
`npm i -DE acast-test-helpers`

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### setupAndTeardownApp

This adds the necessary `beforeEach` and `afterEach` calls to set up and tear down the entire application
between each test method, for acceptance testing.

**Parameters**

-   `renderAppIntoElementWithHistory` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The function that will render your app.
    It will be passed two arguments: the element to render the app into, and the history that will be used.
-   `createHistory` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)?** When called without arguments, this functions should return the history instance to
    use. This instance will then be passed as the second argument to renderAppIntoElementWithHistory (optional, default `()=>{}`)
-   `unrenderAppFromElement` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)?** This will be called when your app should be torn down and removed from the DOM.
    It will receive as only argument the same element that was passed to renderAppIntoElementWithHistory. (optional, default `root=>{}`)

### scaleWindowWidth

Used for testing reactions to window resize events.
The test root div starts at 1024 pixels and can be scaled up or down with this method.
Will trigger a resize event on the `window` object.

**Parameters**

-   `scale` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The scale by which to multiply the current width of the test root div.

### visit

Triggers a route change in your app by pushing to the history.

**Parameters**

-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path to go to.

### click

Waits for an element to show up, and then simulates a user click by triggering a mouse event on that element.

**Parameters**

-   `selector` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [jQuery](#jquery))** The jQuery selector or jQuery object to simulate click on.
    Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Any options to pass along to the simulated mouse event.

**Examples**

```javascript
click('.element-to-click', { clientX: 1337, clientY: 1338 });
```

### mouseDown

Waits for an element to show up, and then simulates a user mouse down by triggering a mouse event on that element.

**Parameters**

-   `selector` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [jQuery](#jquery))** The jQuery selector or jQuery object to simulate mouse down on.
    Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Any options to pass along to the simulated mouse event.

**Examples**

```javascript
mouseDown('.element-to-mouse-down-on', { clientX: 1337, clientY: 1338 });
```

### mouseUp

Waits for an element to show up, and then simulates a user mouse up by triggering a mouse event on that element.

**Parameters**

-   `selector` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [jQuery](#jquery))** The jQuery selector or jQuery object to simulate mouse up on.
    Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Any options to pass along to the simulated mouse event.

**Examples**

```javascript
mouseUp('.element-to-mouse-up-on', { clientX: 1337, clientY: 1338 });
```

### mouseMove

Waits for an element to show up, and then simulates a user mouse move by triggering a mouse event on that element.

**Parameters**

-   `selector` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [jQuery](#jquery))** The jQuery selector or jQuery object to simulate mouse move on.
    Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Any options to pass along to the simulated mouse event.

**Examples**

```javascript
mouseDown('.element-to-mouse-move-on', { clientX: 1337, clientY: 1338 });
```

### fillIn

Waits for an input element to show up, and then simulates a user filling in the value of that input.

**Parameters**

-   `selector` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [jQuery](#jquery))** The jQuery selector or jQuery object to fill in.
    Note that the selector or jQuery object must represent exactly one (1) input element in the app, or the call will fail.
    This will trigger 'input' and 'changed' events on the selected input element.
-   `value` **any** The value to fill into the input.

**Examples**

```javascript
fillIn('.input-container input', 'awesome value');
```

### keyEventIn

Trigger a key event in an element.

**Parameters**

-   `selector` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [jQuery](#jquery))** The jQuery selector or object of element(s) to trigger key event in.
-   `keyEventString` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The type of key event to trigger, e. g. 'keydown', 'keyup' or 'keypress'
-   `keyCode` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The integer representing which key is being pressed.

### waitUntilExists

Waits until at least one element in the app matches a selector.

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The jQuery selector to wait for matches on.
-   `errorMessage` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** The error message to show if the function times out waiting for the selector
    to give a match. If could also be a function that should return the error message string. If it is a function
    it will be called as late as possible, after having timed out. (optional, default `` `acast-test-helpers#waitUntilExists(): Selector never showed up: '${selector}'` ``)

### waitUntilDisappears

First waits for at least one element in the app to match a selector, and then waits for all of those elements to
go away.

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The jQuery selector to first receive a match and then to stop doing so.

### waitUntilDoesNotExist

Waits for a selector not to have any matching elements in the app.

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The jQuery selector to check for match.
-   `errorMessage` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** The error message to show, either as a string or as a function returning
    a string, that will be called when the error message is needed. (optional, default `` `acast-test-helpers#waitUntilDoesNotExist(): Selector never stopped existing: '${selector}'` ``)

### find

Convenience method to matching jQuery selectors within the app only (and not in the entire window).

**Parameters**

-   `selector` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The jQuery selector to match.

Returns **[jQuery](#jquery)** The jQuery object matching the selector within the app.

### jQuery

Simply the jQuery constructor.

### setupAsync

Sets up the async test tools by adding the appropriate calls to `beforeEach` and `afterEach`.
Call once in the top of a `describe` that you wish to use the async tools in.
NOTE: When using [setupAndTeardownApp](#setupandteardownapp), it is not necessary to call this function separately.

### andThen

Triggers a callback after the previous asynchronous tool function resolves.

**Parameters**

-   `doThis` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function to call when the previous asynchronous tool function resolves. This
    function will receive as argument the resolved result of that previous asynchronous tool function.

**Examples**

```javascript
waitUntilExists('.some-element');
andThen(someElementAsJqueryObject => {
  // someElementAsJqueryObject is the result of matching '.some-element'.
});
```

### waitUntil

Waits until a callback returns any truthy value. It waits by polling the function repeatedly.
This is very useful for verifying test results, among other things.

**Parameters**

-   `thisReturnsTruthy` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The function to poll.
-   `errorMessage` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** The string, or function returning a string, to be shown if this times out. (optional, default `` `acast-test-helpers#waitUntil() timed out since the following function never returned a truthy value within the timeout: ${thisReturnsTruthy}` ``)

**Examples**

```javascript
waitUntil(() => expect(foobar).to.equal(3)); // This will either pass as the expectation holds and is returned as truthy, or keep polling.
```

```javascript
waitUntil(() => 3);
andThen(value => {
  // value = 3
});
```

### waitMillis

Waits a specific number of milliseconds.
NOTE: Using this method is highly discouraged for anything other than temporary
experiments. The reason is that it leads to either very long running or non-deterministic tests,
none of which is desirable.

**Parameters**

-   `milliseconds` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The number of milliseconds to wait.

### waitUntilChange

Waits until a function gives a different return value from one call to the next.

**Parameters**

-   `predicate` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The function to be polled.
-   `errorMessage` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** The string, or function returning a string, to be shown if this times out. (optional, default `` `acast-test-helpers#waitUntilChange() timed out since the return value of the following function never changed: ${predicate}` ``)

**Examples**

```javascript
let foo = 'something';
waitUntilChange(() => foo);
andThen(theNewValueOfFoo => {
  console.log(theNewValueOfFoo); // 'something else'
});
setTimeout(() => {
  foo = 'something else';
}, 1000);
```

### setupFakeFetchAsync

Convenience method to set up everything needed to use fake fetch in an async environment.
Calls [setupAsync](#setupasync), [setupFakeFetch](#setupfakefetch) and [teardownFakeFetch](#teardownfakefetch).

Use this by calling it once on top of the appropriate `describe`.

### waitUntilFetchExists

-   **See: [waitUntilXhrExists](#waituntilxhrexists)**

Waits until a fetch call has been made, and resolves with the same return value as in [fetchRespond](#fetchrespond).

**Parameters**

-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The fetched path to wait for. Same as in [fetchRespond](#fetchrespond).

**Examples**

```javascript
waitUntilFetchExists('/api/user/1337');
andThen(request => {
  request.resolveWith(200, {
    id: 1337,
    name: 'Fire'
  });
});
```

### setupFakeFetch

Replaces the global `window.fetch` function with a fake one to intercept any calls to fetch, and enable the
tools in this module.
Should be called before each test method that wants to fake fetch.

### teardownFakeFetch

Restores the original `window.fetch` method and tears down what was set up with [setupFakeFetch](#setupfakefetch).
Should be called after each test method before which [setupFakeFetch](#setupfakefetch) was called.

### fetchRespond

Resolve to a previously intercepted fetch call.

**Parameters**

-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path of the previous fetch call to respond to.

**Examples**

```javascript
fetchRespond('/api/user/1337').resolveWith(200, {
  id: 1337,
  name: 'Fire'
});
```

Returns **{resolveWith: (function (any?, any?)), rejectWith: (function (any?))}** An object with two methods:
`resolveWith` and `rejectWith`. Most often you want to use `resolveWith`, since even HTTP errors such as 404 will
result in a resolved fetch promise. `resolveWith` takes two arguments: the HTTP status, and the JSON return value.

### startFakingXhr

Replaces the real XMLHttpRequest constructor with a fake one to intercept any subsequent XHR call.

### stopFakingXhr

Restores the real XMLHttpRequest constructor to the original one that was replaced by [startFakingXhr](#startfakingxhr).

### findXhr

Finds a previously made and still unresolved XHR request.

**Parameters**

-   `method` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A string representing what HTTP Method of the request to find, like 'GET' or 'POST'
-   `url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The complete url, including any query string, of the request to find

Returns **([FakeRequest](#fakerequest) | null)** The matching [FakeRequest](#fakerequest), or null if no matching request was found.

### waitUntilXhrExists

-   **See: [waitUntilFetchExists](#waituntilfetchexists)**

Asynchronous version of [findXhr](#findxhr).
Waits until the matched XHR request shows up, and then passes it to the next asynchronous function.
If the test times out while waiting for the request to show up, a helpful error message will show which requests
where active.

**Parameters**

-   `method` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Same as in [findXhr](#findxhr)
-   `url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Same as in [findXhr](#findxhr)

**Examples**

```javascript
waitUntilXhrExists('GET', '/api/user/1337');
andThen(request => {
  request.respondWithJson(200, {
    id: 1337,
    name: 'Fire'
  });
});
```

### FakeRequest

Extends [FakeXMLHttpRequest](https://github.com/pretenderjs/FakeXMLHttpRequest) to register each new request with fakehr

Also has the convenience method `respondWithJson` that takes two arguments:
the HTTP status code as an int, and the response body as a plain object (that will be stringified by the function)

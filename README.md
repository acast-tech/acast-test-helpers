# acast-test-helpers
For testing with Mocha. Currently only runs in browsers, see 
[issue #1](https://github.com/acastSthlm/acast-test-helpers/issues/1). 
Contains helpers for async and acceptance tests, and also two different 
ways to stub server calls: one for when using window.fetch, and another 
for using regular XHR.

## Example
```js
import { 
  setupAndTeardownApp, 
  visit,
  click,
  waitUntilExists,
  andThen,
  waitUntilXhrExists,
  waitUntilFetchExists,
} from 'acast-test-helpers';
import { createMemoryHistory } from 'react-router';
import renderMyApp from 'renderMyApp.js';

describe('my app', () => {
  setupAndTeardownApp(createMemoryHistory, renderMyApp);
   
  it('shows greeting when I click the hello button on the say-hello page', () => {
    visit('/say-hello');
    
    click('.hello-button') // This will wait for the button to show up, and then click it. Any jQuery selector will work.
    
    waitUntilExists('.greeting'); // After the click has been performed, this will start looking for the greeting.
    
    andThen(greeting => { // When the greeting appears, it will be passed as the single argument to the function passed to the following `andThen` call. 
      expect(greeting.text()).to.equal('Hello World!'); // `greeting` is a jQuery object. 
    });
  });
  
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
  
  it('shows the color of the day (using Fetch API)', () => {
    visit('/color');
    
    waitUntilFetchExists('/api/v1/color');
    
    andThen(fetchRequest => {
      fetchRequest.resolveWith(200, {
        color: '#65a1e7'
      });
    });
    
    waitUntil(() => expect(find('.color-of-the-day').css('background-color')).to.equal('#65a1e7');
  });
});

```

## Installation
Make sure to add our GemFury repo to you npm path with something like 
this: https://github.com/acastSthlm/test-setup-and-examples/blob/master/.npmrc

Then simply:
`npm install --save-dev --save-exact acast-test-helpers`
/*
 Acast Test Helpers
 Copyright (C) 2017 Acast AB

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 For more information about this program, or to contact the authors,
 see https://github.com/acastSthlm/acast-test-helpers
 */
import $ from 'jquery';
import { setupAsync, andThen, waitUntil } from './async';

let root;
let history;

/**
 * Used for testing reactions to window resize events.
 * The test root div starts at 1024 pixels and can be scaled up or down with this method.
 * Will trigger a resize event on the `window` object.
 * @param {number} scale The scale by which to multiply the current width of the test root div.
 */
export function scaleWindowWidth(scale) {
  andThen(() => {
    var $root = $(root);
    const currentWidth = $root.width();
    const newWidth = currentWidth * scale;
    $root.css('width', `${newWidth}px`);
    window.dispatchEvent(new Event('resize'));
  });
}

function setupApp(createHistory, renderAppIntoElementWithHistory) {
  history = createHistory();

  root = createRootForTests();

  renderAppIntoElementWithHistory(root, history);
}

function teardownApp(unrenderApp) {
  unrenderApp(root);
  document.body.removeChild(root);
  root = null;

  history = null;
}

function createRootForTests() {
  const root = document.createElement('div');
  root.id = 'test-root';
  root.style.width = root.style.height = '1024px';
  document.body.appendChild(root);

  return root;
}

/**
 * This adds the necessary `beforeEach` and `afterEach` calls to set up and tear down the entire application
 * between each test method, for acceptance testing.
 * @param {function} renderAppIntoElementWithHistory The function that will render your app.
 * It will be passed two arguments: the element to render the app into, and the history that will be used.
 * @param {function} [createHistory] When called without arguments, this functions should return the history instance to
 * use. This instance will then be passed as the second argument to renderAppIntoElementWithHistory
 * @param {function} [unrenderAppFromElement] This will be called when your app should be torn down and removed from the DOM.
 * It will receive as only argument the same element that was passed to renderAppIntoElementWithHistory.
 */
export function setupAndTeardownApp(
  renderAppIntoElementWithHistory,
  createHistory = () => {},
  unrenderAppFromElement = root => {}
) {
  if (!renderAppIntoElementWithHistory) {
    throw new Error(
      'acast-test-helpers#setupAndTeardownApp(): Requires at least one argument: renderAppIntoElementWithHistory'
    );
  }

  if (renderAppIntoElementWithHistory.length < 1) {
    throw new Error(
      'acast-test-helpers#setupAndTeardownApp(): renderAppIntoElementWithHistory has to accept at least one argument: (elementToRenderInto)'
    );
  }

  setupAsync();

  beforeEach(() => setupApp(createHistory, renderAppIntoElementWithHistory));

  afterEach(() => teardownApp(unrenderAppFromElement));
}

/**
 * Triggers a route change in your app by pushing to the history.
 * @param {string} route The path to go to.
 */
export function visit(route) {
  if (!history) {
    throw new Error(
      'acast-test-helpers#visit(): You cannot use visit() unless you pass a valid createHistory function to setupAndTeardownApp() at the root of the appropriate describe()!'
    );
  }
  andThen(() => {
    history.push(route);
  });
}

/**
 * Waits for an element to show up, and then simulates a user click by triggering a mouse event on that element.
 * @param {string|jQuery} selector The jQuery selector or jQuery object to simulate click on.
 * Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
 * @param {object} [options] Any options to pass along to the simulated mouse event.
 * @example
 * click('.element-to-click', { clientX: 1337, clientY: 1338 });
 */
export function click(selector, options) {
  triggerMouseEvent(click, selector, options, ['mousedown', 'mouseup']);
}

/**
 * Waits for an element to show up, and then simulates a user mouse down by triggering a mouse event on that element.
 * @param {string|jQuery} selector The jQuery selector or jQuery object to simulate mouse down on.
 * Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
 * @param {object} [options] Any options to pass along to the simulated mouse event.
 * @example
 * mouseDown('.element-to-mouse-down-on', { clientX: 1337, clientY: 1338 });
 */
export function mouseDown(selector, options) {
  triggerMouseEvent(mouseDown, selector, options);
}

/**
 * Waits for an element to show up, and then simulates a user mouse up by triggering a mouse event on that element.
 * @param {string|jQuery} selector The jQuery selector or jQuery object to simulate mouse up on.
 * Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
 * @param {object} [options] Any options to pass along to the simulated mouse event.
 * @example
 * mouseUp('.element-to-mouse-up-on', { clientX: 1337, clientY: 1338 });
 */
export function mouseUp(selector, options) {
  triggerMouseEvent(mouseUp, selector, options);
}

/**
 * Waits for an element to show up, and then simulates a user mouse move by triggering a mouse event on that element.
 * @param {string|jQuery} selector The jQuery selector or jQuery object to simulate mouse move on.
 * Note that the selector or jQuery object must represent exactly one (1) element in the app, or the call will fail.
 * @param {object} [options] Any options to pass along to the simulated mouse event.
 * @example
 * mouseDown('.element-to-mouse-move-on', { clientX: 1337, clientY: 1338 });
 */
export function mouseMove(selector, options) {
  triggerMouseEvent(mouseMove, selector, options);
}

function triggerMouseEvent(
  exportedFunction,
  selector,
  options,
  mouseEventsToTriggerFirst = []
) {
  const functionName = exportedFunction.name;
  const eventName = functionName.toLowerCase();
  waitUntilExists(
    selector,
    `acast-test-helpers#${functionName}(): Selector never showed up '${selector}'`
  );
  andThen(jqueryElement => {
    expect(jqueryElement.length).to.equal(
      1,
      `acast-test-helpers#${functionName}(): Found more than one match for selector: '${selector}'`
    );

    const evaluatedOptions = typeof options === 'function'
      ? options()
      : options;

    function triggerMouseEvent(eventName) {
      const event = createMouseEvent(eventName, evaluatedOptions);
      jqueryElement[0].dispatchEvent(event);
    }

    const mouseEventsToTrigger = mouseEventsToTriggerFirst.concat([eventName]);

    mouseEventsToTrigger.forEach(eventName => {
      triggerMouseEvent(eventName);
    });
  });
}

/**
 * Waits for an input element to show up, and then simulates a user filling in the value of that input.
 * @param {string|jQuery} selector The jQuery selector or jQuery object to fill in.
 * Note that the selector or jQuery object must represent exactly one (1) input element in the app, or the call will fail.
 * This will trigger 'input' and 'changed' events on the selected input element.
 * @param {*} value The value to fill into the input.
 * @example
 * fillIn('.input-container input', 'awesome value');
 */
export function fillIn(selector, value) {
  waitUntilExists(
    selector,
    `acast-test-helpers#fillIn(): Selector never showed up '${selector}'`
  );
  andThen(jqueryElement => {
    expect(jqueryElement.length).to.equal(
      1,
      `acast-test-helpers#fillIn(): Found more than one match for selector: '${selector}'`
    );
    const target = jqueryElement[0];

    const potentialInputClasses = [
      HTMLInputElement,
      HTMLSelectElement,
      HTMLTextAreaElement,
    ];
    const inputClass = potentialInputClasses.find(
      potential => target instanceof potential
    );

    const originalValueSetter = Object.getOwnPropertyDescriptor(
      inputClass.prototype,
      'value'
    ).set; // https://github.com/cypress-io/cypress/issues/536#issuecomment-311694226
    originalValueSetter.call(target, value);

    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/**
 * Trigger a key event in an element.
 * @param {string|jQuery} selector The jQuery selector or object of element(s) to trigger key event in.
 * @param {string} keyEventString The type of key event to trigger, e. g. 'keydown', 'keyup' or 'keypress'
 * @param {number} keyCode The integer representing which key is being pressed.
 */
export function keyEventIn(selector, keyEventString, keyCode) {
  waitUntilExists(
    selector,
    `acast-test-helpers#keyEventIn(): Selector never showed up: '${selector}'`
  );
  andThen(jqueryElement => {
    const event = new Event(keyEventString, { bubbles: true });
    event.keyCode = keyCode;
    jqueryElement.get(0).dispatchEvent(event);
  });
}

/**
 * Waits until at least one element in the app matches a selector.
 * @param {string} selector The jQuery selector to wait for matches on.
 * @param {string|function} errorMessage The error message to show if the function times out waiting for the selector
 * to give a match. If could also be a function that should return the error message string. If it is a function
 * it will be called as late as possible, after having timed out.
 */
export function waitUntilExists(
  selector,
  errorMessage = `acast-test-helpers#waitUntilExists(): Selector never showed up: '${selector}'`
) {
  waitUntil(() => {
    const selected = $(selector, root);
    return selected.length ? selected : false;
  }, errorMessage);
}

/**
 * First waits for at least one element in the app to match a selector, and then waits for all of those elements to
 * go away.
 * @param {string} selector The jQuery selector to first receive a match and then to stop doing so.
 */
export function waitUntilDisappears(selector) {
  waitUntilExists(
    selector,
    `acast-test-helpers#waitUntilDisappears(): Selector never showed up: '${selector}'`
  );
  waitUntilDoesNotExist(
    selector,
    `acast-test-helpers#waitUntilDisappears(): Selector showed up but never disappeared: '${selector}'`
  );
}

/**
 * Waits for a selector not to have any matching elements in the app.
 * @param {string} selector The jQuery selector to check for match.
 * @param {string|function} errorMessage The error message to show, either as a string or as a function returning
 * a string, that will be called when the error message is needed.
 */
export function waitUntilDoesNotExist(
  selector,
  errorMessage = `acast-test-helpers#waitUntilDoesNotExist(): Selector never stopped existing: '${selector}'`
) {
  waitUntil(() => {
    return $(selector, root).length === 0;
  }, errorMessage);
}

/**
 * Convenience method to matching jQuery selectors within the app only (and not in the entire window).
 * @param {string} selector The jQuery selector to match.
 * @returns {jQuery} The jQuery object matching the selector within the app.
 */
export const find = selector => $(selector, root);

/**
 * Simply the jQuery constructor.
 */
export const jQuery = $;

function createMouseEvent(
  type,
  {
    bubbles = true,
    cancelable = type != 'mousemove',
    view = window,
    detail = 0,
    screenX = 0,
    screenY = 0,
    clientX = 0,
    clientY = 0,
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    metaKey = false,
    button = 0,
    relatedTarget = document.body.parentNode,
  } = {}
) {
  var result;

  try {
    result = new MouseEvent(type, options);
  } catch (e) {
    result = document.createEvent('MouseEvents');
    result.initMouseEvent(
      type,
      bubbles,
      cancelable,
      view,
      detail,
      screenX,
      screenY,
      clientX,
      clientY,
      ctrlKey,
      altKey,
      shiftKey,
      metaKey,
      button,
      relatedTarget
    );
  }

  return result;
}

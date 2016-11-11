import $ from 'jquery';
import { setupAsync, andThen, waitUntil } from './async';

let root;
let history;

export function setWindowWidthPercent(widthPercent) {
  andThen(() => {
    $(root).css('width', `${widthPercent}%`);
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
  history = null;
  root = null;
}

function createRootForTests() {
  const root = document.createElement('div');
  root.id = 'test-root';
  root.style.width = root.style.height = '100%';
  document.body.appendChild(root);

  return root;
}

export function setupAndTeardownApp(createHistory, renderAppIntoElementWithHistory, unrenderAppFromElement = root => document.body.removeChild(root)) {
  if (!createHistory || !renderAppIntoElementWithHistory) {
    throw new Error('acast-test-helpers#setupAndTeardownApp(): Requires two arguments: createHistory and renderAppIntoElementWithHistory');
  }

  if (renderAppIntoElementWithHistory.length < 1) {
    throw new Error('acast-test-helpers#setupAndTeardownApp(): renderAppIntoElementWithHistory has to accept at least one argument: (elementToRenderInto)');
  }

  setupAsync();

  beforeEach(() => setupApp(createHistory, renderAppIntoElementWithHistory));

  afterEach(() => teardownApp(unrenderAppFromElement));
}

export function visit(route) {
  if (!history) {
    throw new Error('acast-test-helpers#visit(): You cannot use visit() unless you call setupAndTeardownApp() at the root of the appropriate describe()!');
  }
  andThen(() => {
    history.push(route);
  });
}

export function click(selector, options) {
  triggerMouseEvent(click, selector, options);
}

export function mouseDown(selector, options) {
  triggerMouseEvent(mouseDown, selector, options);
}

export function mouseUp(selector, options) {
  triggerMouseEvent(mouseUp, selector, options);
}

export function mouseMove(selector, options) {
  triggerMouseEvent(mouseMove, selector, options);
}

function triggerMouseEvent(exportedFunction, selector, options) {
  const functionName = exportedFunction.name;
  const eventName = functionName.toLowerCase();
  waitUntilExists(selector, `acast-test-helpers#${functionName}(): Selector never showed up '${selector}'`);
  andThen((jqueryElement) => {
    expect(jqueryElement.length).to.equal(1,
      `acast-test-helpers#${functionName}(): Found more than one match for selector: '${selector}'`);

    const evaluatedOptions = typeof options === 'function' ? options() : options;
    const event = createMouseEvent(eventName, evaluatedOptions);
    jqueryElement[0].dispatchEvent(event);
  });
}

export function fillIn(selector, value) {
  waitUntilExists(selector, `acast-test-helpers#fillIn(): Selector never showed up '${selector}'`);
  andThen(jqueryElement => {
    expect(jqueryElement.length).to.equal(1, `acast-test-helpers#fillIn(): Found more than one match for selector: '${selector}'`);
    const target = jqueryElement[0];
    target.value = value;
    target.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export function keyEventIn(selector, keyEventString, keyCode) {
  waitUntilExists(selector, `acast-test-helpers#keyEventIn(): Selector never showed up: '${selector}'`);
  andThen(jqueryElement => {
    const event = new Event(keyEventString, { bubbles: true });
    event.keyCode = keyCode;
    jqueryElement.get(0).dispatchEvent(event);
  });
}

export function waitUntilExists(selector, errorMessage = `acast-test-helpers#waitUntilExists(): Selector never showed up: '${selector}'`) {
  waitUntil(() => {
    const selected = $(selector, root);
    return selected.length ? selected : false;
  }, errorMessage);
}

export function waitUntilDisappears(selector) {
  waitUntilExists(selector, `acast-test-helpers#waitUntilDisappears(): Selector never showed up: '${selector}'`);
  waitUntilDoesNotExist(selector, `acast-test-helpers#waitUntilDisappears(): Selector showed up but never disappeared: '${selector}'`);
}

export function waitUntilDoesNotExist(selector, errorMessage = `acast-test-helpers#waitUntilDoesNotExist(): Selector never stopped existing: '${selector}'`) {
  waitUntil(() => {
    return $(selector, root).length === 0;
  }, errorMessage);
}

export const find = (selector) => ($(selector, root));

function createMouseEvent(type, {
  bubbles = true,
  cancelable = (type != "mousemove"),
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
  relatedTarget = document.body.parentNode
} = {}) {
  var result;

  try {
    result = new MouseEvent(type, options);
  }
  catch (e) {
    result = document.createEvent("MouseEvents");
    result.initMouseEvent(type,
      bubbles, cancelable, view, detail,
      screenX, screenY, clientX, clientY,
      ctrlKey, altKey, shiftKey, metaKey,
      button, relatedTarget
    );
  }

  return result;
}


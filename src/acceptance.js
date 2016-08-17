import $ from 'jquery';
import { setupAsync, andThen, waitUntil } from './async';

let root;
let history;

function setupApp(createHistory, renderAppWithHistoryIntoElement) {
  history = createHistory();

  root = document.createElement('div');
  document.body.appendChild(root);

  renderAppWithHistoryIntoElement(history, root);
}

function teardownApp() {
  document.body.removeChild(root);
  
  history = null;
  root = null;
}

export function setupAndTeardownApp(createHistory, renderAppWithHistoryIntoElement) {
  if (!createHistory || !renderAppWithHistoryIntoElement) {
    throw new Error('setupAndTearDownApp() requires two arguments: createHistory and renderAppWithHistoryIntoElement');
  }

  if (renderAppWithHistoryIntoElement.length !== 2) {
    throw new Error('renderAppWithHistoryIntoElement has to accept two arguments: (createHistory, elementToRenderInto)');
  }

  setupAsync();

  beforeEach(() => setupApp(createHistory, renderAppWithHistoryIntoElement));

  afterEach(teardownApp);
}

export function visit(route) {
  if (!history) {
    throw new Error('You cannot use visit() unless you call setupAndTeardownApp() at the root of the appropriate describe()!');
  }
  andThen(() => {
    history.push(route);
  });
}

export function click(selector) {
  waitUntilExists(selector);
  andThen((jqueryElement) => {
    expect(jqueryElement.length).to.equal(1, `Cannot click selector '${selector}'`);
    const rawElementToClick = jqueryElement.get(0);
    const clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent('click', true /* bubble */, true /* cancelable */);
    rawElementToClick.dispatchEvent(clickEvent);
  });
}

export function fillIn(selector, value) {
  waitUntilExists(selector);
  andThen(jqueryElement => {
    expect(jqueryElement.length).to.equal(1, `Cannot fillIn selector '${selector}'`);
    const target = jqueryElement[0];
    target.value = value;
    target.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export function keyEventIn(selector, keyEventString, keyCode) {
  waitUntilExists(selector);
  andThen(jqueryElement => {
    const event = new Event(keyEventString, { bubbles: true });
    event.keyCode = keyCode;
    jqueryElement.get(0).dispatchEvent(event);
  });
}

export function waitUntilExists(selector, pollInterval = 100) {
  waitUntil(() => {
    const selected = $(selector);
    return selected.length ? selected : false;
  }, pollInterval);
}

export function waitUntilDisappears(selector, pollInterval = 100) {
  waitUntilExists(selector, pollInterval);
  waitUntil(() => {
    return $(selector).length === 0;
  }, pollInterval);
}

export const find = $;
import $ from 'jquery';
import { useRouterHistory } from 'react-router';
import { createMemoryHistory } from 'history';
import { unmountComponentAtNode } from 'react-dom';
import { setupAsync, andThen, waitUntil } from './async';

let history;
let root;

function setupApp(renderAppWithHistoryIntoElement) {
  history = useRouterHistory(createMemoryHistory)({ queryKey: false });

  root = document.createElement('div');
  document.body.appendChild(root);

  renderAppWithHistoryIntoElement(history, root);
}

function teardownApp() {
  unmountComponentAtNode(root);
  document.body.removeChild(root);
  
  history = null;
  root = null;
}

export function setupAndTeardownApp(renderAppWithHistoryIntoElement) {
  if (!renderAppWithHistoryIntoElement || renderAppWithHistoryIntoElement.length !== 2) {
    throw new Error('setupAndTeardownApp() requires a single argument that is a function with two parameters: (history, elementToRenderInto)');
  }

  setupAsync();

  beforeEach('setup app', () => setupApp(renderAppWithHistoryIntoElement));

  afterEach('teardown app', teardownApp);
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
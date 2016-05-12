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
}

export function setupAndTeardownApp(renderAppWithHistoryIntoElement) {
  setupAsync();

  beforeEach('setup app', () => setupApp(renderAppWithHistoryIntoElement));

  afterEach('teardown app', teardownApp);
}

export function visit(route) {
  andThen(() => {
    history.push(route);
  });
}

export function click(selector) {
  andThen(() => {
    const jqueryElement = $(selector);
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

export const find = $;
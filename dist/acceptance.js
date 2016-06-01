'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.find = undefined;
exports.setupAndTeardownApp = setupAndTeardownApp;
exports.visit = visit;
exports.click = click;
exports.waitUntilExists = waitUntilExists;
exports.waitUntilDisappears = waitUntilDisappears;

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _history = require('history');

var _reactDom = require('react-dom');

var _async = require('./async');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var history = void 0;
var root = void 0;

function setupApp(renderAppWithHistoryIntoElement) {
  history = (0, _history.createMemoryHistory)();

  root = document.createElement('div');
  document.body.appendChild(root);

  renderAppWithHistoryIntoElement(history, root);
}

function teardownApp() {
  (0, _reactDom.unmountComponentAtNode)(root);
  document.body.removeChild(root);

  history = null;
  root = null;
}

function setupAndTeardownApp(renderAppWithHistoryIntoElement) {
  if (!renderAppWithHistoryIntoElement || renderAppWithHistoryIntoElement.length !== 2) {
    throw new Error('setupAndTeardownApp() requires a single argument that is a function with two parameters: (history, elementToRenderInto)');
  }

  (0, _async.setupAsync)();

  beforeEach('setup app', function () {
    return setupApp(renderAppWithHistoryIntoElement);
  });

  afterEach('teardown app', teardownApp);
}

function visit(route) {
  if (!history) {
    throw new Error('You cannot use visit() unless you call setupAndTeardownApp() at the root of the appropriate describe()!');
  }
  (0, _async.andThen)(function () {
    history.push(route);
  });
}

function click(selector) {
  waitUntilExists(selector);
  (0, _async.andThen)(function (jqueryElement) {
    expect(jqueryElement.length).to.equal(1, 'Cannot click selector \'' + selector + '\'');
    var rawElementToClick = jqueryElement.get(0);
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent('click', true /* bubble */, true /* cancelable */);
    rawElementToClick.dispatchEvent(clickEvent);
  });
}

function waitUntilExists(selector) {
  var pollInterval = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];

  (0, _async.waitUntil)(function () {
    var selected = (0, _jquery2.default)(selector);
    return selected.length ? selected : false;
  }, pollInterval);
}

function waitUntilDisappears(selector) {
  var pollInterval = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];

  waitUntilExists(selector, pollInterval);
  (0, _async.waitUntil)(function () {
    return (0, _jquery2.default)(selector).length === 0;
  }, pollInterval);
}

var find = exports.find = _jquery2.default;
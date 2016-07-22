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

var _async = require('./async');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = void 0;
var history = void 0;

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

function setupAndTeardownApp(createHistory, renderAppWithHistoryIntoElement) {
  if (!createHistory || !renderAppWithHistoryIntoElement) {
    throw new Error('setupAndTearDownApp() requires two arguments: createHistory and renderAppWithHistoryIntoElement');
  }

  if (renderAppWithHistoryIntoElement.length !== 2) {
    throw new Error('renderAppWithHistoryIntoElement has to accept two arguments: (createHistory, elementToRenderInto)');
  }

  (0, _async.setupAsync)();

  beforeEach(function () {
    return setupApp(createHistory, renderAppWithHistoryIntoElement);
  });

  afterEach(teardownApp);
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
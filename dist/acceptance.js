'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.find = undefined;
exports.setupAndTeardownApp = setupAndTeardownApp;
exports.visit = visit;
exports.click = click;
exports.waitUntilExists = waitUntilExists;

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _reactRouter = require('react-router');

var _history = require('history');

var _reactDom = require('react-dom');

var _async = require('./async');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var history = void 0;
var root = void 0;

function setupApp(renderAppWithHistoryIntoElement) {
  history = (0, _reactRouter.useRouterHistory)(_history.createMemoryHistory)({ queryKey: false });

  root = document.createElement('div');
  document.body.appendChild(root);

  renderAppWithHistoryIntoElement(history, root);
}

function teardownApp() {
  (0, _reactDom.unmountComponentAtNode)(root);
  document.body.removeChild(root);
}

function setupAndTeardownApp(renderAppWithHistoryIntoElement) {
  (0, _async.setupAsync)();

  beforeEach('setup app', function () {
    return setupApp(renderAppWithHistoryIntoElement);
  });

  afterEach('teardown app', teardownApp);
}

function visit(route) {
  (0, _async.andThen)(function () {
    history.push(route);
  });
}

function click(selector) {
  (0, _async.andThen)(function () {
    var jqueryElement = (0, _jquery2.default)(selector);
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

var find = exports.find = _jquery2.default;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupMockStoreWithMiddlewares = setupMockStoreWithMiddlewares;
exports.givenState = givenState;
exports.whenDispatching = whenDispatching;
exports.thenNoActionsWereDispatched = thenNoActionsWereDispatched;
exports.thenActionsWereDispatched = thenActionsWereDispatched;

var _reduxMockStore = require('redux-mock-store');

var _reduxMockStore2 = _interopRequireDefault(_reduxMockStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockStore = (0, _reduxMockStore2.default)();

var store = void 0;

function setupMockStoreWithMiddlewares(middlewares) {
  mockStore = (0, _reduxMockStore2.default)(middlewares);
}

function givenState(state) {
  store = mockStore(state);
}

function whenDispatching(action) {
  store.dispatch(action);
}

function thenNoActionsWereDispatched() {
  expect(store.getActions()).to.be.empty();
}

function thenActionsWereDispatched(actions) {
  var storeActions = store.getActions();
  actions.forEach(function (a) {
    return expect(storeActions).to.contain(a);
  });
}